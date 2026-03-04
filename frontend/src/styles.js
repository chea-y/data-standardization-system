import Swal from 'sweetalert2';
export const containerStyle = { display: 'flex', flexDirection: 'column', gap: '10px' };
export const sectionStyle = { backgroundColor: '#fff', border: '1px solid #ddd', padding: '13px', borderRadius: '4px' };
export const searchBarStyle = { display: 'flex', alignItems: 'center', gap: '10px' };
export const inputStyle = { padding: '8px', width: '250px', border: '1px solid #ccc', borderRadius: '4px' };
export const titleStyle = { margin: '0 0 6px 0', fontSize: '20px', color: '#0056b3', borderLeft: '4px solid #0056b3', paddingLeft: '10px' };

// 공통 베이스 (중복 코드 방지용)
export const gridBase = {
  overflowY: 'auto',
  border: '1px solid #ccc',
  borderRadius: '4px',
  backgroundColor: '#fff',
};

// 1. 단어 목록용 (5칸 기준)
export const fiveGridStyle = {
  ...gridBase,
  // maxHeight: '200px',
  height: '200px',
};

// 2. 용어 목록용 (10칸 기준)
export const tenGridStyle = {
  ...gridBase,
  // maxHeight: '360px',
  height: '360px',
};

export const headerRowStyle = { backgroundColor: '#f8f9fa', position: 'sticky', top: 0, zIndex: 1 };
// 1. 테이블 자체 스타일
export const tableStyle = { 
  width: '100%', 
  borderCollapse: 'collapse', 
  fontSize: '13px',
  tableLayout: 'fixed' // 🚀 핵심: 열 너비 강제 고정
};

// 2. 공통 셀 스타일 (th, td 공통 적용)
export const commonCellStyle = {
  // fontSize: '11px', // 주석시 13px
  border: '1px solid #ddd',
  padding: '6px 10px',
  // padding: '10px',
  whiteSpace: 'nowrap',    // 줄바꿈 방지
  overflow: 'hidden',      // 넘치는 부분 숨김
  textOverflow: 'ellipsis' // 넘치면 '...' 표시
};

// 3. 헤더 셀 스타일
export const thStyle = { 
  ...commonCellStyle,
  backgroundColor: '#f2f2f2', 
  textAlign: 'center',
  position: 'sticky', //행(tr)이 아니라 셀(th)에 sticky
  top: 0,      
  zIndex: 2,        
};

// 4. 데이터 셀 스타일
export const tdStyle = { 
  ...commonCellStyle 
};

export const emptyTdStyle = { 
  // ...gridBase,
  textAlign: 'center', 
  height: '100%',     // 부모 높이를 따라가도록 설정 (선택 사항)
  padding: '50px 0', // padding을 늘려 납작해지는 것을 방지
  color: '#999',
  verticalAlign: 'middle' 
};

export const rowStyle = { borderBottom: '1px solid #eee' };

export const countTextStyle = {
  textAlign: 'right',
  marginTop: '8px',
  fontSize: '15px',
  color: '#666',
  fontWeight: 'bold'
};


// 라디오 버튼을 감싸는 세로형 컨테이너
export const radioGroupStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
  marginTop: '15px',
  padding: '12px',
  backgroundColor: '#f9f9f9',
  borderRadius: '4px',
  border: '1px solid #eee'
};

// 개별 라디오 항목 (글자와 버튼 정렬)
export const radioLabelStyle = {
  cursor: 'pointer',
  fontSize: '14px',
  display: 'flex',
  alignItems: 'center',
  gap: '8px'
};

// 1. 타이틀을 감싸는 전체 컨테이너
export const titleContainerStyle = {
  borderBottom: '2px solid #000',
  paddingBottom: '10px',
  marginBottom: '10px',
  marginTop: '-3px',      // 상단 여백 제거를 위해 살짝 올림
  display: 'flex',
  alignItems: 'baseline',
  gap: '10px'
};

// 2. 메인 제목 (h1)
export const mainTitleStyle = {
  margin: 0,
  fontSize: '32px',
  fontWeight: 'bold',
  lineHeight: '1'
};

// 3. 서브 설명 (span)
export const subTitleStyle = {
  fontSize: '14px',
  color: '#333'
};


/* =========================================
   추가된 공통 유틸리티 스타일
   ========================================= */

// 전체 너비를 꽉 채우는 인풋 (공통 적용 스타일 대체)
export const fullWidthInputStyle = { 
  ...inputStyle, 
  width: '100%', 
  boxSizing: 'border-box', 
  display: 'block' 
};

// 양쪽 정렬 헤더 (버튼 그룹 등)
export const flexBetweenStyle = { 
  display: 'flex', 
  justifyContent: 'space-between', 
  alignItems: 'center', 
  marginBottom: '15px' 
};

// 단순 가로 정렬 (gap 포함)
export const flexGapStyle = { 
  display: 'flex', 
  gap: '8px' 
};

// 테이블 래퍼 (보더 포함)
export const borderedTableStyle = {
  ...tableStyle,
  border: '1px solid #ddd',
  borderCollapse: 'collapse',
  tableLayout: 'fixed'
};

/* =========================================
   PhraseAdd(용어등록) 전용 스타일
   ========================================= */

// 1. 논리명 입력 그리드 컨테이너
export const logicInputContainerStyle = { 
  display: 'flex', 
  gap: '15px', 
  justifyContent: 'flex-start', 
  maxWidth: '800px' 
};

// 2. 개별 단어 입력칸 래퍼 (relative 포지션용)
export const inputWrapperStyle = { 
  width: '120px', 
  position: 'relative' 
};

// 3. 자동완성 드롭다운 박스
export const suggestionBoxStyle = { 
  position: 'absolute', 
  top: '105%', 
  left: 0, 
  minWidth: '200px', 
  backgroundColor: '#fff', 
  border: '1px solid #4a90e2', 
  zIndex: 9999, 
  boxShadow: '0 8px 16px rgba(0,0,0,0.2)', 
  maxHeight: '200px', 
  overflowY: 'auto' 
};

// 4. 자동완성 아이템
export const suggestionItemStyle = { 
  padding: '10px 12px', 
  cursor: 'pointer', 
  borderBottom: '1px solid #eee', 
  fontSize: '13px' 
};

// 5. 텍스트 에어리어 (높이 지정)
export const textAreaStyle = { 
  ...fullWidthInputStyle, 
  height: '60px', 
  resize: 'none', 
  padding: '10px', 
  border: '1px solid #ddd' 
};

// // 6. 테이블 내 '편집' 버튼
// export const miniButtonStyle = { 
//   padding: '4px 12px', 
//   backgroundColor: 'transparent', 
//   color: '#007bff', 
//   border: '1px solid #007bff', 
//   borderRadius: '4px', 
//   cursor: 'pointer', 
//   fontSize: '12px', 
//   fontWeight: '600' 
// };

// 7. 읽기 전용 인풋 (배경색 처리용 베이스)
export const readOnlyInputBaseStyle = {
  ...fullWidthInputStyle,
  fontWeight: '800',
  border: '1px solid'
};

// 8. 중복 경고 뱃지
export const warningBadgeStyle = { 
  position: 'absolute', 
  left: '102%', 
  color: '#dc3545', 
  fontSize: '11px', 
  fontWeight: 'bold', 
  whiteSpace: 'nowrap' 
};

/* =========================================
   PhraseAdd 페이지 전용 스타일
   ========================================= */

// 입력 필드 컨테이너 (논리명 6개 배치용)
export const logicContainer = { display: 'flex', gap: '15px', maxWidth: '800px' };

// 개별 입력 래퍼 (relative: 드롭다운 위치 기준)
export const inputWrapper = { width: '120px', position: 'relative' };

// 자동완성 드롭다운 박스
export const suggestionBox = { 
  position: 'absolute', top: '105%', left: 0, width: '100%', 
  backgroundColor: '#fff', border: '1px solid #4a90e2', 
  zIndex: 10, maxHeight: '200px', overflowY: 'auto', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' 
};

// 자동완성 아이템
export const suggestionItem = { padding: '8px', cursor: 'pointer', borderBottom: '1px solid #eee', fontSize: '13px' };

// 꽉 차는 인풋 (기본)
export const fullInput = { ...inputStyle, width: '100%', boxSizing: 'border-box', display: 'block' };

// 텍스트 에어리어
export const textArea = { ...fullInput, height: '60px', resize: 'none' };

// [상태별 스타일] - 병합해서 사용
export const inputError = { borderColor: '#ff4d4f', boxShadow: '0 0 0 1px #ff4d4f' };
// export const inputVerified = { backgroundColor: '#f0faff', borderColor: '#4a90e2' };
export const inputExisting = { backgroundColor: '#fff3cd', color: '#dc3545', borderColor: '#dc3545', fontWeight: 'bold' };

// 테이블 내 미니 버튼
export const miniBtn = { 
  padding: '4px 8px', fontSize: '12px', cursor: 'pointer', 
  backgroundColor: '#fff', border: '1px solid #007bff', color: '#007bff', borderRadius: '3px' 
};

// 상단 버튼 그룹 정렬
export const btnGroup = { display: 'flex', gap: '8px' };
export const headerFlex = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' };


/* =========================================
   Title & Count Badge 유틸리티
   ========================================= */

// 타이틀과 건수를 감싸는 컨테이너
export const titleFlexStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px'
};

// 세로 구분선 (Divider)
export const dividerStyle = {
  width: '1px',
  height: '14px',
  backgroundColor: '#ddd'
};

// 건수 표시 텍스트 래퍼
export const countWrapperStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  color: '#999',
  fontSize: '13px',
  fontWeight: '500',
  letterSpacing: '-0.5px'
};

// 강조된 숫자 스타일
export const countNumberStyle = {
  color: '#555',
  marginLeft: '2px'
};

// 버튼 공통 베이스 (일관된 높이와 정렬)
const buttonBase = {
  padding: '6px 14px',
  borderRadius: '4px',
  fontSize: '13px',
  fontWeight: '600',
  cursor: 'pointer',
  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: '34px', // 입력창과 높이 통일
  border: '1px solid transparent',
};

// 1. 조회 버튼 (메인 포인트 - 딥블루)
export const blueButtonStyle = {
  ...buttonBase,
  width: '66px',        // 모든 버튼 너비 고정
  backgroundColor: '#0056b3',
  color: '#ffffff',
  boxShadow: '0 2px 0 rgba(0, 0, 0, 0.045)',
  outline: 'none',
};

// 2. 등록 버튼 (서브 포인트 - 보더 스타일)
export const grayButtonStyle = {
  ...buttonBase,
  width: '100px',        // 모든 버튼 너비 고정
  backgroundColor: '#ffffff',
  color: '#555555',
  border: '1px solid #d9d9d9',
  boxShadow: '0 2px 0 rgba(0, 0, 0, 0.015)',
};

// 2. 등록 버튼 (서브 포인트 - 보더 스타일)
export const clearButtonStyle = {
  ...buttonBase,
  width: '66px',        // 모든 버튼 너비 고정
  backgroundColor: '#ffffff',
  color: '#555555',
  border: '1px solid #d9d9d9',
  boxShadow: '0 2px 0 rgba(0, 0, 0, 0.015)',
};

// 3. 편집/삭제용 미니 버튼 (표 내부용)
export const miniButtonStyle = {
  ...buttonBase,
  padding: '2px 8px',
  fontSize: '11px',
  height: '24px',
  backgroundColor: '#f5f5f5',
  border: '1px solid #d9d9d9',
  color: '#666',
};

// 입력값이 있거나 선택되었을 때의 테두리 강조 스타일
export const inputVerified = { 
  borderColor: '#4a90e2',     // 신뢰감을 주는 파란색 테두리
  boxShadow: '0 0 0 1px #4a90e2', // 테두리를 좀 더 선명하게 (선택사항)
  borderWidth: '1px',
  borderStyle: 'solid'
};

// 읽기 전용/비활성화 스타일
export const inputDisabled = {
  backgroundColor: '#f5f5f5',
  borderColor: '#ddd',
  cursor: 'not-allowed'
};

/* =========================================
   SweetAlert2(Swal) 공통 테마 설정
   ========================================= */

const SWAL_CONFIRM_COLOR = '#0056b3'; 
const SWAL_CANCEL_COLOR = '#666';
const SWAL_DELETE_COLOR = '#ff4d4f';
const SWAL_WIDTH = '350px'; 
const SWAL_PADDING = '1rem';

// 공통 베이스 설정
const compactBase = {
  width: SWAL_WIDTH,
  padding: SWAL_PADDING,
  confirmButtonColor: SWAL_CONFIRM_COLOR,
  confirmButtonText: '확인',
};

// 1. 성공 알림
export const swalSuccess = (title, text) => ({
  ...compactBase,
  icon: 'success',
  html: `
    <div style="font-size: 18px; font-weight: bold; margin-bottom: 5px;">${title || '완료'}</div>
    <div style="font-size: 14px; color: #666; line-height: 1.2;">${text || '성공적으로 처리되었습니다.'}</div>
  `,
});

// 2. 로딩 알림
export const swalLoading = (title) => ({
  ...compactBase,
  title: title || '처리 중...',
  allowOutsideClick: false,
  didOpen: () => {
    Swal.showLoading();
  },
});

// 3. 경고/오류 알림
export const swalError = (title, text) => ({
  ...compactBase,
  icon: 'error',
  html: `
    <div style="font-size: 18px; font-weight: bold; margin-bottom: 5px;">${title || '오류'}</div>
    <div style="font-size: 14px; color: #666; line-height: 1.2;">${text || '작업 중 에러가 발생했습니다.'}</div>
  `,
});

// 4. 삭제 확인 알림
export const swalDeleteConfirm = (title, text) => ({
  ...compactBase,
  icon: 'warning',
  html: `
    <div style="font-size: 18px; font-weight: bold; margin-bottom: 5px;">${title || '삭제하시겠습니까?'}</div>
    <div style="font-size: 14px; color: #666; line-height: 1.2;">${text || '삭제된 데이터는 복구할 수 없습니다.'}</div>
  `,
  showCancelButton: true,
  confirmButtonColor: SWAL_DELETE_COLOR,
  cancelButtonColor: SWAL_CANCEL_COLOR,
  confirmButtonText: '삭제',
  cancelButtonText: '취소',
  reverseButtons: true, 
});

// 도메인등록 드롭박스
export const customSelect = {
  width: '100%',
  boxSizing: 'border-box',
  display: 'block',
  appearance: 'none', // 브라우저 기본 화살표 제거
  WebkitAppearance: 'none',
  MozAppearance: 'none',
  // 세련된 화살표 SVG 삽입
  backgroundImage: `url('data:image/svg+xml;charset=US-ASCII,<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="%23666" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>')`,
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'right 12px center',
  backgroundSize: '14px',
  padding: '8px 32px 8px 12px',
  borderRadius: '4px',
  border: '1px solid #d9d9d9',
  backgroundColor: '#fff',
  fontSize: '14px',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
};

// 포커스 되었을 때의 스타일
export const selectFocus = {
  borderColor: '#40a9ff',
  outline: 'none',
  boxShadow: '0 0 0 2px rgba(24, 144, 255, 0.2)',
};

// 읽기 전용 인풋 (옆의 자동표시창)
export const readOnlyInput = {
  width: '100%',
  boxSizing: 'border-box',
  display: 'block',
  padding: '8px 12px',
  borderRadius: '4px',
  border: '1px solid #e9ecef',
  backgroundColor: '#f8f9fa',
  color: '#666',
  fontSize: '14px',
};

