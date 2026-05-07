# Design System MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Standardize the frontend design system foundation with minimal visual churn by tightening tokens, primitives, and accessibility in high-use shell and learning pages.

**Architecture:** Keep `src/index.css` as the canonical token layer and preserve existing page CSS. Improve core primitives first, then apply targeted accessibility fixes to shell, quiz, flashcard, and education pages without broad restyling.

**Tech Stack:** React 19, TypeScript, Vite, Tailwind CSS, Zustand, TanStack Query, Lucide React.

---

## File Structure

- Modify `src/index.css`: add semantic app tokens and legacy alias mappings; keep existing utilities intact.
- Modify `src/components/ui/Button.tsx`: normalize motion timing and loading semantics.
- Modify `src/components/ui/Card.tsx`: normalize motion timing.
- Modify `src/components/ui/Input.tsx`: add `aria-invalid` and `aria-describedby` support for error/helper text.
- Modify `src/components/layout/Header.tsx`: add `aria-label` and menu state semantics to icon-only controls.
- Modify `src/components/layout/Sidebar.tsx`: add `aria-label` to icon-only controls and drawer close/logout buttons.
- Modify `src/pages/Education.tsx`: add search input label semantics and language filter pressed state.
- Modify `src/pages/quiz/QuizListPage.tsx`: add dialog semantics, labels/ids for touched modal fields, aria labels, and remove emoji labels from system selects.
- Modify `src/pages/FlashcardDecks.tsx`: add dialog semantics, labels/ids for touched modal fields, aria labels, and replace emoji placeholder.

---

### Task 1: Canonical Semantic Tokens

**Files:**
- Modify: `src/index.css:13-58`

- [ ] **Step 1: Add semantic token aliases to `:root`**

Replace the top `:root` token block with this expanded token block, preserving the existing rendering settings after it:

```css
:root {
  /* Canonical app tokens */
  --app-bg: #020617;
  --app-bg-elevated: #0f172a;
  --app-surface: #1e293b;
  --app-surface-hover: #334155;
  --app-border: rgba(255, 255, 255, 0.1);
  --app-border-strong: rgba(255, 255, 255, 0.18);
  --app-text: #f8fafc;
  --app-text-muted: #94a3b8;
  --app-text-subtle: #64748b;
  --app-primary: #10b981;
  --app-primary-hover: #059669;
  --app-accent: #8b5cf6;
  --app-warning: #f59e0b;
  --app-danger: #ef4444;
  --app-focus: #22d3ee;
  --app-glass-bg: rgba(15, 23, 42, 0.72);
  --app-glass-border: var(--app-border);
  --app-glass-shadow: 0 18px 45px rgba(0, 0, 0, 0.28);
  --app-motion-fast: 150ms;
  --app-motion-base: 200ms;
  --app-motion-slow: 300ms;

  /* Learning Palette */
  --color-primary: var(--app-warning);
  --color-primary-dark: #d97706;
  --color-secondary: var(--app-accent);
  --color-success: var(--app-primary);
  --color-success-light: #34d399;
  --color-danger: var(--app-danger);
  --color-danger-light: #f87171;
  --color-warning: var(--app-warning);
  --color-warning-light: #fbbf24;

  /* Dark theme colors */
  --bg-primary: var(--app-bg-elevated);
  --bg-secondary: var(--app-surface);
  --bg-tertiary: var(--app-surface-hover);
  --text-primary: var(--app-text);
  --text-secondary: var(--app-text-muted);
  --text-muted: var(--app-text-subtle);

  /* Glass effect */
  --glass-bg: var(--app-glass-bg);
  --glass-border: var(--app-glass-border);
  --glass-shadow: var(--app-glass-shadow);

  /* Legacy shell aliases maintained for compatibility */
  --stock-bg-primary: var(--app-bg);
  --stock-bg-secondary: var(--app-bg-elevated);
  --stock-card-bg: var(--app-glass-bg);
  --stock-glass-border: var(--app-glass-border);
  --stock-text-primary: var(--app-text);
  --stock-text-secondary: var(--app-text-muted);
  --stock-text-tertiary: var(--app-text-subtle);
  --stock-primary-400: #34d399;
  --stock-primary-500: var(--app-primary);
  --stock-primary-600: var(--app-primary-hover);
  --stock-accent-rose: #fb7185;

  /* Legacy high-contrast accents maintained for compatibility */
  --neon-pink: #ff10f0;
  --neon-cyan: #00f5ff;
  --neon-purple: #b026ff;
  --neon-blue: #0080ff;
  --neon-green: #00ff9f;
  --neon-yellow: #ffd700;
  --neon-red: #ff0055;
  --neon-orange: #ff6b35;
  --cyber-900: var(--app-bg-elevated);

  /* Typography */
  font-family: 'IBM Plex Sans', 'Inter', system-ui, -apple-system, sans-serif;
  line-height: 1.6;
  font-weight: 400;

  /* Rendering */
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
```

- [ ] **Step 2: Run build after token change**

Run: `npm run build`

Expected: build either passes or fails only with pre-existing TypeScript issues unrelated to CSS tokens.

---

### Task 2: Primitive Interaction Defaults

**Files:**
- Modify: `src/components/ui/Button.tsx`
- Modify: `src/components/ui/Card.tsx`
- Modify: `src/components/ui/Input.tsx`

- [ ] **Step 1: Normalize Button transition timing and loading accessibility**

In `src/components/ui/Button.tsx`, change the base transition class from:

```tsx
'transition-all duration-400 motion-reduce:transition-none',
```

to:

```tsx
'transition-colors transition-transform duration-200 motion-reduce:transition-none',
```

Change the button element to include `aria-busy`:

```tsx
<button
  ref={ref}
  className={cn(
    baseStyles,
    variants[variant],
    sizes[size],
    className
  )}
  disabled={disabled || isLoading}
  aria-busy={isLoading || undefined}
  {...props}
>
```

- [ ] **Step 2: Normalize Card transition timing**

In `src/components/ui/Card.tsx`, change:

```tsx
'transition-all duration-400 motion-reduce:transition-none',
```

to:

```tsx
'transition-colors transition-transform transition-shadow duration-200 motion-reduce:transition-none',
```

- [ ] **Step 3: Add Input described-by accessibility**

In `src/components/ui/Input.tsx`, after `const inputId = props.id || generatedId;`, add:

```tsx
const messageId = `${inputId}-message`;
```

Update the `<input>` element to include:

```tsx
aria-invalid={!!error || undefined}
aria-describedby={(error || helperText) ? messageId : props['aria-describedby']}
```

Update the helper/error `<p>` to include the id:

```tsx
<p
  id={messageId}
  className={cn(
    'text-sm',
    error ? 'text-neon-red' : 'text-gray-400'
  )}
>
```

- [ ] **Step 4: Run build after primitive changes**

Run: `npm run build`

Expected: no new TypeScript errors from `Button`, `Card`, or `Input`.

---

### Task 3: Shell Accessibility

**Files:**
- Modify: `src/components/layout/Header.tsx`
- Modify: `src/components/layout/Sidebar.tsx`

- [ ] **Step 1: Add accessible labels in Header**

In `src/components/layout/Header.tsx`, add these attributes:

```tsx
<button
  type="button"
  onClick={onToggleMobileSidebar}
  aria-label="Mở menu điều hướng"
  className="lg:hidden p-2 rounded-xl transition-all duration-200"
  style={{ color: 'var(--stock-text-tertiary)' }}
>
```

```tsx
<button
  type="button"
  onClick={onToggleSidebar}
  aria-label="Thu gọn hoặc mở rộng thanh điều hướng"
  className="hidden lg:flex p-2 rounded-xl transition-all duration-200 hover:bg-white/5"
  style={{ color: 'var(--stock-text-tertiary)' }}
>
```

```tsx
<button
  type="button"
  onClick={() => setMobileSearchOpen((value) => !value)}
  aria-label={mobileSearchOpen ? 'Đóng tìm kiếm' : 'Mở tìm kiếm'}
  aria-expanded={mobileSearchOpen}
  className="md:hidden p-2 rounded-xl transition-all duration-200"
  style={{ color: 'var(--stock-text-tertiary)' }}
>
```

```tsx
<button
  type="button"
  onClick={onToggleNotifications}
  aria-label="Mở thông báo"
  aria-expanded={isNotificationsOpen}
  className="relative p-2.5 rounded-xl transition-all duration-200 group hover:bg-white/5"
  style={{ color: 'var(--stock-text-tertiary)' }}
>
```

```tsx
<button
  type="button"
  onClick={onToggleProfile}
  aria-label="Mở menu tài khoản"
  aria-expanded={isProfileOpen}
  className="flex items-center gap-3 p-1.5 rounded-xl transition-all duration-200 group hover:bg-white/5"
>
```

- [ ] **Step 2: Add accessible labels in Sidebar**

In `src/components/layout/Sidebar.tsx`, update icon-only buttons:

```tsx
<button
  type="button"
  onClick={onLogout}
  aria-label="Đăng xuất"
  className="p-2 rounded-lg transition-all hover:bg-white/5"
  style={{ color: 'var(--stock-text-tertiary)' }}
  title="Đăng xuất"
>
```

```tsx
<button
  type="button"
  onClick={onLogout}
  aria-label="Đăng xuất"
  className="p-1.5 rounded-lg transition-all hover:bg-white/5"
  style={{ color: 'var(--stock-text-tertiary)' }}
>
```

```tsx
<button
  type="button"
  onClick={onToggle}
  aria-label={isSidebarOpen ? 'Thu gọn thanh điều hướng' : 'Mở rộng thanh điều hướng'}
  className="stock-sidebar-link justify-center w-full"
>
```

```tsx
<button
  type="button"
  onClick={onClose}
  aria-label="Đóng menu điều hướng"
  className="p-1.5 rounded-lg hover:bg-white/5 transition-all"
  style={{ color: 'var(--stock-text-tertiary)' }}
>
```

```tsx
<button
  type="button"
  onClick={() => { onLogout(); onClose(); }}
  className="stock-sidebar-link w-full"
  style={{ color: 'var(--stock-accent-rose)' }}
>
```

- [ ] **Step 3: Run build after shell changes**

Run: `npm run build`

Expected: no JSX or TypeScript errors from Header or Sidebar.

---

### Task 4: Education Page Accessibility

**Files:**
- Modify: `src/pages/Education.tsx`

- [ ] **Step 1: Label search input**

Change the search input in `src/pages/Education.tsx` to:

```tsx
<input
  type="text"
  placeholder="Tìm khóa học, ngôn ngữ..."
  value={searchQuery}
  onChange={(event) => setSearchQuery(event.target.value)}
  aria-label="Tìm khóa học hoặc ngôn ngữ"
/>
```

- [ ] **Step 2: Add pressed state to filter chips**

Update the all-languages button:

```tsx
<button
  type="button"
  onClick={() => setSelectedLanguage(null)}
  aria-pressed={selectedLanguage === null}
  className={clsx('chip', selectedLanguage === null && 'active')}
>
```

Update language buttons:

```tsx
<button
  type="button"
  key={language.id}
  onClick={() => setSelectedLanguage(language.id)}
  aria-pressed={selectedLanguage === language.id}
  className={clsx('chip', selectedLanguage === language.id && 'active')}
>
```

- [ ] **Step 3: Run build after Education changes**

Run: `npm run build`

Expected: no JSX or TypeScript errors from `Education.tsx`.

---

### Task 5: Quiz Modal And Form Accessibility

**Files:**
- Modify: `src/pages/quiz/QuizListPage.tsx`

- [ ] **Step 1: Add dialog semantics**

Change the modal panel wrapper to:

```tsx
<div
  role="dialog"
  aria-modal="true"
  aria-labelledby="quiz-form-title"
  className="bg-slate-900/95 backdrop-blur-xl rounded-3xl shadow-[0_0_60px_rgba(0,0,0,0.5)] border border-white/10 max-w-2xl w-full my-8 p-8"
>
```

Change the modal title to:

```tsx
<h2 id="quiz-form-title" className="text-2xl font-black font-headline text-white flex items-center gap-3">
```

Change close button to:

```tsx
<button
  type="button"
  onClick={closeQuizModal}
  aria-label="Đóng form quiz"
  className="p-2.5 rounded-xl hover:bg-white/5 text-slate-500 hover:text-white border border-transparent hover:border-white/10 text-xl"
>
```

- [ ] **Step 2: Label search and topic filter**

Update search input:

```tsx
<input
  type="text"
  placeholder="Tìm quiz..."
  value={searchQuery}
  onChange={(e) => setSearchQuery(e.target.value)}
  aria-label="Tìm quiz"
  className="bg-transparent border-none outline-none text-white placeholder-slate-600 text-sm w-full"
/>
```

Update topic filter select:

```tsx
<select
  value={topicFilter}
  onChange={(e) => setTopicFilter(e.target.value)}
  aria-label="Lọc quiz theo chủ đề"
  className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-accent-500"
>
```

- [ ] **Step 3: Link primary modal labels to inputs**

For the first two fields, change labels and inputs to:

```tsx
<label htmlFor="quiz-name" className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
  Tên quiz *
</label>
<input
  id="quiz-name"
  type="text"
  value={form.name}
  onChange={(e) => setForm((current) => ({ ...current, name: e.target.value }))}
  placeholder="Ví dụ: HSK 1 cơ bản"
  className="w-full px-4 py-3.5 rounded-xl bg-black/40 border border-white/5 text-white placeholder-slate-600 focus:border-accent-500 focus:ring-1 focus:ring-accent-500 outline-none"
/>
```

```tsx
<label htmlFor="quiz-topic" className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
  Chủ đề
</label>
<input
  id="quiz-topic"
  type="text"
  value={form.topic}
  onChange={(e) => setForm((current) => ({ ...current, topic: e.target.value }))}
  placeholder="Ví dụ: Chào hỏi"
  className="w-full px-4 py-3.5 rounded-xl bg-black/40 border border-white/5 text-white placeholder-slate-600 focus:border-accent-500 focus:ring-1 focus:ring-accent-500 outline-none"
/>
```

- [ ] **Step 4: Remove emoji labels from difficulty options**

Replace difficulty options with:

```tsx
<option value="EASY" className="bg-slate-800">Easy</option>
<option value="MEDIUM" className="bg-slate-800">Medium</option>
<option value="HARD" className="bg-slate-800">Hard</option>
<option value="MIXED" className="bg-slate-800">Mixed</option>
```

- [ ] **Step 5: Run build after quiz changes**

Run: `npm run build`

Expected: no JSX or TypeScript errors from `QuizListPage.tsx`.

---

### Task 6: Flashcard Modal And Form Accessibility

**Files:**
- Modify: `src/pages/FlashcardDecks.tsx`

- [ ] **Step 1: Label search input and filter button**

Update search input:

```tsx
<input
  type="text"
  placeholder="Tìm bộ thẻ..."
  value={searchQuery}
  onChange={(e) => setSearchQuery(e.target.value)}
  aria-label="Tìm bộ thẻ flashcard"
  className="bg-transparent border-none outline-none text-white placeholder-slate-600 text-sm w-full"
/>
```

Update filter button:

```tsx
<button
  type="button"
  aria-label="Mở bộ lọc flashcard"
  className="flex items-center gap-2 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all"
>
```

- [ ] **Step 2: Add dialog semantics**

Change the modal panel wrapper to:

```tsx
<div
  role="dialog"
  aria-modal="true"
  aria-labelledby="flashcard-deck-form-title"
  className="bg-slate-800 border border-white/10 rounded-3xl shadow-2xl max-w-md w-full p-8"
>
```

Change the modal title to:

```tsx
<h2 id="flashcard-deck-form-title" className="text-2xl font-black font-headline text-white mb-6">
```

- [ ] **Step 3: Link modal labels to inputs**

For the deck name field, use:

```tsx
<label htmlFor="deck-name" className="block text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">
  Tên bộ thẻ *
</label>
<input
  id="deck-name"
  type="text"
  value={deckForm.name}
  onChange={(e) => setDeckForm((current) => ({ ...current, name: e.target.value }))}
  placeholder="Ví dụ: Tiếng Nhật cơ bản"
  className="w-full px-4 py-3 bg-black/40 rounded-xl border border-white/5 focus:border-accent-500 focus:ring-1 focus:ring-accent-500 outline-none transition-all text-white placeholder-slate-600"
/>
```

For the icon field, use:

```tsx
<label htmlFor="deck-icon" className="block text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">
  Biểu tượng
</label>
<input
  id="deck-icon"
  type="text"
  value={deckForm.icon}
  onChange={(e) => setDeckForm((current) => ({ ...current, icon: e.target.value }))}
  placeholder="Icon ngắn"
  className="w-full px-4 py-3 bg-black/40 rounded-xl border border-white/5 focus:border-accent-500 focus:ring-1 focus:ring-accent-500 outline-none transition-all text-center text-2xl text-white"
/>
```

- [ ] **Step 4: Run build after flashcard changes**

Run: `npm run build`

Expected: no JSX or TypeScript errors from `FlashcardDecks.tsx`.

---

### Task 7: Final Verification

**Files:**
- Verify all modified files.

- [ ] **Step 1: Run production build**

Run: `npm run build`

Expected: build completes successfully. If it fails, inspect the errors and fix only errors introduced by this plan.

- [ ] **Step 2: Run lint if build passes**

Run: `npm run lint`

Expected: lint completes or reports only pre-existing issues. Do not apply broad lint auto-fixes outside touched files.

- [ ] **Step 3: Review changed files**

Run: `git diff -- src/index.css src/components/ui/Button.tsx src/components/ui/Card.tsx src/components/ui/Input.tsx src/components/layout/Header.tsx src/components/layout/Sidebar.tsx src/pages/Education.tsx src/pages/quiz/QuizListPage.tsx src/pages/FlashcardDecks.tsx`

Expected: diff contains only token, primitive, accessibility, and modal/form quick-win changes described in this plan.

---

## Self-Review

- Spec coverage: tokens, primitives, shell accessibility, forms/modals, visual consistency, and verification are covered by Tasks 1-7.
- Placeholder scan: no open-ended placeholders remain; each step names exact files, snippets, and commands.
- Type consistency: JSX attributes use valid React attributes; no new helper functions or types are required.
