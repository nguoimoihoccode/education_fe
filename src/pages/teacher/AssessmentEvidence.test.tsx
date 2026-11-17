import {render,screen,fireEvent,cleanup} from '@testing-library/react';
import {it,expect,vi,afterEach} from 'vitest';
import {AssessmentEvidence} from './AssessmentEvidence';
import {assessmentApi} from '@/api/assessment.api';
vi.mock('@/api/assessment.api',()=>({assessmentApi:{pageAccess:vi.fn(),selectPrimary:vi.fn()}}));
afterEach(()=>{cleanup();vi.restoreAllMocks();});
it('saves normalized main-sheet selection with the current input revision',async()=>{
 vi.mocked(assessmentApi.pageAccess).mockResolvedValue({url:'https://storage.example/private.jpg'});
 vi.mocked(assessmentApi.selectPrimary).mockResolvedValue({});
 vi.spyOn(Element.prototype,'getBoundingClientRect').mockReturnValue({left:0,top:0,width:100,height:200,right:100,bottom:200,x:0,y:0,toJSON:()=>({})});
 render(<AssessmentEvidence assessmentId="a" page={{id:'p',assetId:'asset',sourcePageNumber:1}} inputRevision={3} editable busy={false} run={async fn=>{await fn();}} />);
 fireEvent.click(screen.getByRole('button',{name:'Chọn lại tờ giấy chính'}));
 const canvas=await screen.findByRole('img',{name:'Vùng chọn tờ giấy chính'});
 fireEvent.click(canvas,{clientX:10,clientY:20});fireEvent.click(canvas,{clientX:90,clientY:20});fireEvent.click(canvas,{clientX:90,clientY:180});
 fireEvent.click(screen.getByRole('button',{name:'Lưu vùng giấy và đọc lại'}));
 expect(assessmentApi.selectPrimary).toHaveBeenCalledWith('a','p',3,[[0.1,0.1],[0.9,0.1],[0.9,0.9]]);
});
it('stamps the signed-in viewer on top of a student page image and blocks right-click',async()=>{
 const {useAuthStore}=await import('@/store/auth.store');
 useAuthStore.setState({user:{id:'7',email:'gv@truong.edu.vn',displayName:'Cô Lan',createdAt:'',updatedAt:''}});
 vi.mocked(assessmentApi.pageAccess).mockResolvedValue({url:'https://storage.example/private.jpg'});
 render(<AssessmentEvidence assessmentId="a" page={{id:'p',assetId:'asset',sourcePageNumber:1}} inputRevision={3} editable={false} busy={false} run={async fn=>{await fn();}} />);
 fireEvent.click(screen.getByRole('button',{name:'Xem ảnh và vùng đọc'}));
 const image=await screen.findByRole('img',{name:'Trang bài 1'});
 expect(screen.getByTestId('evidence-watermark').textContent).toContain('gv@truong.edu.vn');
 expect(fireEvent.contextMenu(image)).toBe(false);
 useAuthStore.setState({user:null});
});
