import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { cleanup, render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { useAuthStore } from '@/store/auth.store';
import { DesktopSidebar } from './Sidebar';
import { learningNavSections, navSectionsFor } from './navConfig';

/* The sidebar used to be one fixed list for everybody: learning first, then
   "Tài khoản" in the middle, then four school groups. For a student that was
   seven cards of which most were noise; for a principal the work sat below the
   account links. The groups are now ordered per viewer -- school staff lead with
   their school groups, everyone else leads with learning, and "Tài khoản" is last
   for both -- and the staff-only groups are hidden from people who cannot act in
   them.

   Two decisions are easy to undo by accident and are pinned here:

   1. "Trường của tôi" and "Con của tôi" stay visible to *every* signed-in user,
      even one with no roles at all. A parent account only gains `parent` after
      claiming an invite code, and the `student` role is not read anywhere else in
      the app -- gating either group would hide the page that hands out the role.
   2. Every menu entry points at a distinct destination. `/teaching/timetable`
      and the "Thời khoá biểu" tab of `/me/school` render the same panel; only one
      of them may be a menu item. */

const withRoles = (roles: string[]) =>
  useAuthStore.setState({
    accessToken: 'access-token',
    isAuthenticated: true,
    isLoading: false,
    error: null,
    user: { roles } as never,
  });

/** Renders the sidebar for whatever roles the store currently holds. */
const renderSidebar = (path = '/today') =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <DesktopSidebar
        isSidebarOpen
        isAuthenticated
        displayName="Cô giáo"
        onToggle={() => {}}
        onLogout={() => {}}
      />
    </MemoryRouter>,
  );

const renderFor = (roles: string[], path = '/today') => {
  cleanup();
  withRoles(roles);
  renderSidebar(path);
};

const sectionTitles = () =>
  Array.from(document.querySelectorAll('.stock-sidebar-section-title')).map((el) =>
    el.textContent?.trim(),
  );

const menuItems = () =>
  Array.from(document.querySelectorAll('nav a')).map((el) => ({
    label: el.textContent?.trim() ?? '',
    href: el.getAttribute('href') ?? '',
  }));

const labels = () => menuItems().map((item) => item.label);

beforeEach(() => {
  useAuthStore.setState({
    accessToken: null,
    refreshToken: null,
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
  });
});

afterEach(cleanup);

describe('navSectionsFor orders the groups for the viewer', () => {
  it('leads with learning for a viewer with no school role', () => {
    for (const roles of [[], ['student'], ['parent'], ['education_admin']]) {
      expect(navSectionsFor(roles).map((s) => s.title)).toEqual([
        'Học tập',
        'Trường của tôi',
        'Con của tôi',
        'Tài khoản',
      ]);
    }
  });

  it('leads with the school work for a teacher, a principal and an admin', () => {
    for (const roles of [['teacher'], ['principal'], ['admin']]) {
      expect(navSectionsFor(roles).map((s) => s.title)).toEqual([
        'Quản trị trường',
        'Lớp của tôi',
        'Học tập',
        'Trường của tôi',
        'Con của tôi',
        'Tài khoản',
      ]);
    }
  });

  it('puts "Tài khoản" last and never renders the retired catch-all group', () => {
    for (const roles of [[], ['teacher'], ['principal']]) {
      const titles = navSectionsFor(roles).map((s) => s.title);
      expect(titles.at(-1)).toBe('Tài khoản');
      expect(titles).not.toContain('Khám phá thêm');
      expect(titles).not.toContain('Học hôm nay');
    }
  });

  it('keeps every group reachable from the one canonical list', () => {
    expect(new Set(navSectionsFor(['principal']).map((s) => s.id))).toEqual(
      new Set(learningNavSections.map((s) => s.id)),
    );
  });
});

describe('the rendered sidebar hides only the staff groups', () => {
  it('renders the groups in the order navSectionsFor chose', () => {
    renderFor(['principal']);
    expect(sectionTitles()).toEqual([
      'Quản trị trường',
      'Lớp của tôi',
      'Học tập',
      'Trường của tôi',
      'Con của tôi',
      'Tài khoản',
    ]);

    renderFor([]);
    expect(sectionTitles()).toEqual([
      'Học tập',
      'Trường của tôi',
      'Con của tôi',
      'Tài khoản',
    ]);
  });

  it('drops the empty "Quản trị trường" card for a teacher', () => {
    renderFor(['teacher']);

    expect(sectionTitles()).not.toContain('Quản trị trường');
    expect(sectionTitles()[0]).toBe('Lớp của tôi');
    expect(labels()).toContain('Lớp chủ nhiệm');
  });

  it('shows "Lớp chủ nhiệm" only to school staff', () => {
    for (const roles of [[], ['student'], ['parent']]) {
      renderFor(roles);
      expect(labels()).not.toContain('Lớp chủ nhiệm');
    }

    renderFor(['teacher']);
    expect(labels()).toContain('Lớp chủ nhiệm');
  });

  it('shows the school-admin group only to a principal or an admin', () => {
    for (const roles of [[], ['student'], ['teacher'], ['parent']]) {
      renderFor(roles);
      expect(sectionTitles()).not.toContain('Quản trị trường');
    }

    for (const roles of [['principal'], ['admin']]) {
      renderFor(roles);
      expect(sectionTitles()).toContain('Quản trị trường');
    }
  });

  it('keeps "Trường của tôi" and "Con của tôi" open to a viewer with no roles', () => {
    // The regression `f6e9cb9` fixed: a student signing in saw no way into the
    // school platform. A role-less account must still get both groups.
    renderFor([]);

    expect(sectionTitles()).toContain('Trường của tôi');
    expect(sectionTitles()).toContain('Con của tôi');
    expect(labels()).toContain('Hồ sơ con');
    expect(labels()).toContain('Thời khoá biểu');
  });
});

describe('every menu entry is distinct and real', () => {
  const ALL_ROLES = [[], ['student'], ['teacher'], ['principal'], ['admin'], ['parent']];

  it('never points two entries at the same destination', () => {
    for (const roles of ALL_ROLES) {
      renderFor(roles);
      const hrefs = menuItems().map((item) => item.href);
      expect(
        new Set(hrefs).size,
        `two entries share a destination for roles=[${roles.join(', ')}]`,
      ).toBe(hrefs.length);
    }
  });

  it('keeps "my timetable" to a single menu entry', () => {
    // `/teaching/timetable` renders the same `MyTimetablePanel` as the
    // timetable tab of `/me/school`, so it must not sit in the menu beside it.
    renderFor(['teacher']);

    const hrefs = menuItems().map((item) => item.href);
    expect(hrefs).not.toContain('/teaching/timetable');
    expect(hrefs.filter((href) => href.startsWith('/me/school'))).toEqual([
      '/me/school',
      '/me/school?tab=grades',
      '/me/school?tab=homework',
    ]);
  });

  it('links only to paths App.tsx declares', () => {
    const app = readFileSync(join(process.cwd(), 'src/App.tsx'), 'utf8');
    const declared = new Set([...app.matchAll(/path="([^"]+)"/g)].map((m) => m[1]));

    for (const roles of ALL_ROLES) {
      renderFor(roles);
      for (const { label, href } of menuItems()) {
        expect(declared, `"${label}" links to an undeclared route: ${href}`).toContain(
          href.split('?')[0],
        );
      }
    }
  });
});

describe('the "Trường của tôi" tabs light up one at a time', () => {
  const activeHref = (path: string) => {
    renderFor([], path);
    return document.querySelector('nav a.active')?.getAttribute('href');
  };

  it('marks the default tab at /me/school with no tab param', () => {
    expect(activeHref('/me/school')).toBe('/me/school');
  });

  it('marks the tab that ?tab= names, and only that one', () => {
    expect(activeHref('/me/school?tab=grades')).toBe('/me/school?tab=grades');
    expect(activeHref('/me/school?tab=homework')).toBe('/me/school?tab=homework');
  });

  it('falls back to the default tab when ?tab= is unknown', () => {
    expect(activeHref('/me/school?tab=nonsense')).toBe('/me/school');
  });
});