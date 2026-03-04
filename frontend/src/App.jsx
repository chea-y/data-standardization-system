import React, { useState } from 'react';
import TermSearch from './pages/TermSearch'; 
import TermRegister from './pages/TermRegister';
import VocabSearch from './pages/VocabSearch';
import DomSearch from './pages/DomSearch';
import DomRegister from './pages/DomRegister';
import VocabRegister from './pages/VocabRegister';

function App() {
  const [currentMenu, setCurrentMenu] = useState('term_search');

  // 조회에서 선택한 데이터를 담아 등록 페이지로 넘겨줄 상태
  const [selectedTerm, setSelectedTerm] = useState(null);
  const [selectedVocab, setSelectedVocab] = useState(null);
  const [selectedDom, setSelectedDom] = useState(null);

  // 더블클릭 시 실행될 핸들러
  const handleEditRequest = (termData) => {
    setSelectedTerm(termData);     // 데이터 저장
    setCurrentMenu('term_reg');    // 메뉴를 '용어 등록'으로 변경
  };

  const handleVocabEditRequest = (vocabData) => {
    setSelectedVocab(vocabData);
    setCurrentMenu('vocab_reg'); // 메뉴 이동
  };

  const handleDomEditRequest = (domData) => {
    setSelectedDom(domData);
    setCurrentMenu('dom_reg');
  };


  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100vh', 
      width: '100vw',
      position: 'fixed', 
      top: 0, 
      left: 0,
      overflow: 'hidden' 
    }}>
      
      {/* 1단: 최상단 로고 헤더 */}
      <header style={topHeaderStyle}>
        <div style={topLogoStyle}>
          표준데이터 지원시스템 
          <span style={{fontSize:'12px', fontWeight:'normal', color:'#999', marginLeft: '10px'}}>
            | &nbsp;Standard Data Support System
          </span>
        </div>
      </header>

      {/* 2단: 하단 영역 */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        
        {/* 왼쪽 사이드바 - 7개 메뉴 배치 */}
        <nav style={{ width: '180px', backgroundColor: '#1a237e', color: '#fff', paddingTop: '10px', overflowY: 'auto' }}>
          
          {/* 그룹 1: 용어 관리 */}
          <div style={sideMenuTitle}>용어 관리</div>
          <div style={menuItemStyle(currentMenu === 'term_search')} onClick={() => setCurrentMenu('term_search')}>- 용어 조회</div>
          <div style={menuItemStyle(currentMenu === 'term_reg')} onClick={() => setCurrentMenu('term_reg')}>- 용어 등록</div>

          {/* 그룹 2: 단어 관리 */}
          <div style={sideMenuTitle}>단어 관리</div>
          <div style={menuItemStyle(currentMenu === 'vocab_search')} onClick={() => setCurrentMenu('vocab_search')}>- 단어 조회</div>
          <div style={menuItemStyle(currentMenu === 'vocab_reg')} onClick={() => setCurrentMenu('vocab_reg')}>- 단어 등록</div>

          {/* 그룹 3: 도메인 관리 */}
          <div style={sideMenuTitle}>도메인 관리</div>
          <div style={menuItemStyle(currentMenu === 'dom_search')} onClick={() => setCurrentMenu('dom_search')}>- 도메인 조회</div>
          <div style={menuItemStyle(currentMenu === 'dom_reg')} onClick={() => setCurrentMenu('dom_reg')}>- 도메인 등록</div>

          {/* 그룹 4: 테이블 관리 */}
          <div style={sideMenuTitle}>데이터 관리</div>
          <div style={menuItemStyle(currentMenu === 'table_manage')} onClick={() => setCurrentMenu('table_manage')}>- 테이블 조회/등록</div>

        </nav>

        {/* 오른쪽 메인 본문 */}
        <main style={{ flex: 1, padding: '30px', overflowY: 'auto', backgroundColor: '#f5f7f9' }}>
          {/* 메뉴에 따른 컴포넌트 렌더링 */}

          {/* 1. 용어 조회: 데이터를 보낼 함수(onEdit)를 전달 */}
          {currentMenu === 'term_search' && (
            <TermSearch onEdit={handleEditRequest} />
          )}

          {/* 2. 용어 등록: 선택된 데이터(editData)와 상태 초기화 함수 전달 */}
          {currentMenu === 'term_reg' && (
            <TermRegister 
              editData={selectedTerm} 
              // 컴포넌트가 마운트/언마운트 될 때 부모의 selectedTerm을 비우기 위한 함수
              setEditData={setSelectedTerm} 
            />
          )}
          {currentMenu === 'vocab_search' && <VocabSearch onEdit={handleVocabEditRequest} />}
          {currentMenu === 'vocab_reg' && (
            <VocabRegister 
              editData={selectedVocab} 
              setEditData={setSelectedVocab} 
            />
          )}

          {/* 5. 도메인 조회: onEdit 추가 */}
          {currentMenu === 'dom_search' && (
            <DomSearch onEdit={handleDomEditRequest} />
          )}

          {/* 6. 도메인 등록: Props 전달 및 초기화 함수 추가 */}
          {currentMenu === 'dom_reg' && (
            <DomRegister 
              editData={selectedDom} 
              setEditData={setSelectedDom} 
            />
          )}
          
          {/* 아직 안 만든 페이지들은 임시 메시지 */}
          {['table_manage'].includes(currentMenu) && (
            <div style={{padding: '40px', textAlign: 'center', color: '#666'}}>
              <h2>{currentMenu.toUpperCase()} 페이지 준비 중입니다.</h2>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

// --- 스타일 ---


const topHeaderStyle = {
  width: '100%',
  boxSizing: 'border-box', // padding을 너비 안으로 포함
  backgroundColor: '#fff',
  padding: '12px 30px',
  display: 'flex',
  alignItems: 'center',
  borderBottom: '1px solid #ddd',
  zIndex: 10
};

const topLogoStyle = { fontSize: '22px', fontWeight: '900', color: '#1a237e' };

const sideMenuTitle = {
  padding: '3px 20px 2px 20px',
  fontSize: '11px',
  color: '#929ac9', 
  fontWeight: 'bold',
  textTransform: 'uppercase',
  letterSpacing: '1px'
};

const menuItemStyle = (isActive) => ({
  padding: '12px 25px',
  cursor: 'pointer',
  fontSize: '16px',
  // 활성화 시 배경은 살짝 밝은 남색, 비활성화는 투명
  backgroundColor: isActive ? '#ffffff30' : 'transparent',
  // 활성화 시 글자는 흰색 유지 (또는 아주 밝은 하늘색)
  color: isActive ? '#00e5ff' : '#fff',
  fontWeight: isActive ? 'bold' : 'normal',
  // 왼쪽 포인트 바를 노란색 대신 '스카이 블루'로 변경
  borderLeft: isActive ? '4px solid #00e5ff' : '4px solid transparent',
  transition: '0.2s'
});



export default App;