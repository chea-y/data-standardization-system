import React, { useState, useRef } from 'react';
import axios from 'axios';
import * as s from '../styles';

function TermSearch({ onEdit }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState('logic'); // 'logic' 또는 'physic'
  const [wordList, setWordList] = useState([]);
  const [terminologyList, setTerminologyList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [confirmedSearch, setConfirmedSearch] = useState({ term: '', type: '' });
  
  const inputRef = useRef(null);

  const handleSearch = async () => {
    setLoading(true);
    try {
      const encoded = encodeURIComponent(searchTerm);
      const [wordRes, terminologyRes] = await Promise.all([
        axios.get(`http://localhost:8000/term_words?keyword=${encoded}&target=${searchType}`),
        axios.get(`http://localhost:8000/terminologys?keyword=${encoded}&target=${searchType}`)
      ]);
      setWordList(wordRes.data);
      setTerminologyList(terminologyRes.data);
      setConfirmedSearch({ term: searchTerm, type: searchType });
    } catch (err) {
      console.error(err);
      alert("데이터 로드 실패");
    } finally {
      setLoading(false);
    }
  };

  const handleTypeChange = (type) => {
    setSearchType(type);
    setSearchTerm(''); 
    
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 10);
  };

  return (
    <div style={s.containerStyle}>
      <div style={s.titleContainerStyle}>
        <h1 style={s.mainTitleStyle}>용어 조회</h1>
        <span style={s.subTitleStyle}>
          - 단어의 조합으로 형성된 문구 (단, 어미가 도메인으로 종결되어야 한다)
        </span>
      </div>

      <div style={{ display: 'flex', gap: '20px', alignItems: 'stretch' }}>
        {/* [좌측] 검색 영역 섹션 */}
        <div style={{ ...s.sectionStyle, flex: '0 0 450px' }}>
          <h3 style={s.titleStyle}>[ 검색 조건 ]</h3>
          <div style={s.searchBarStyle}>
            <strong>검색어 : </strong>
            <input 
              key={searchType}
              ref={inputRef}
              autoFocus
              type={searchType === 'physic' ? "url" : "text"} 
              value={searchTerm}
              placeholder={searchType === 'logic' ? "논리(한글)명 입력" : "물리(영문)명 입력"} 
              style={{
                  ...s.inputStyle,
                  imeMode: searchType === 'logic' ? 'active' : 'disabled',
                  WebkitImeMode: searchType === 'logic' ? 'active' : 'disabled'
              }}
              onChange={(e) => {
                  let val = e.target.value;
                  if (searchType === 'physic') {
                    val = val.replace(/[^a-zA-Z0-9_]/g, '').toUpperCase();
                  }
                  setSearchTerm(val);
                }}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button 
              style={{ 
                ...s.blueButtonStyle, 
                opacity: loading ? 0.6 : 1,
                filter: 'brightness(1)' 
              }}
              onMouseOver={(e) => e.currentTarget.style.filter = 'brightness(1.4)'}
              onMouseOut={(e) => e.currentTarget.style.filter = 'brightness(1)'}
              onClick={handleSearch} 
              disabled={loading}
            >
              {'조회'}
            </button>
          </div>

          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '10px', 
            marginTop: '10px',
            padding: '10px',
            backgroundColor: '#f9f9f9',
            borderRadius: '4px'
          }}>
            <label style={{ cursor: 'pointer', fontSize: '14px' }}>
              <input 
                type="radio" 
                checked={searchType === 'logic'} 
                onChange={() => handleTypeChange('logic')} 
              /> 용어논리명(한글) 기준
            </label>
            <label style={{ cursor: 'pointer', fontSize: '14px' }}>
              <input 
                type="radio" 
                checked={searchType === 'physic'} 
                onChange={() => handleTypeChange('physic')} 
              /> 용어물리명(영문) 기준
            </label>
          </div>

          {confirmedSearch.type && (
            <div style={{ 
              marginTop: '15px', 
              padding: '12px', 
              borderLeft: '4px solid #0056b3', 
              backgroundColor: '#eef6ff', 
              borderRadius: '0 4px 4px 0',
              fontSize: '14px',
              animation: 'fadeIn 0.5s ease-in' 
            }}>
              <span style={{ color: '#555', fontWeight: 'bold' }}>조회 키워드 : </span>
              <span style={{ color: '#0056b3', fontSize: '20px', fontWeight: '800', marginLeft: '5px' }}>
                {confirmedSearch.term ? `" ${confirmedSearch.term} "` : '(전체 항목)'} 
              </span>
              <span style={{ color: '#777', fontSize: '12px', marginLeft: '5px' }}>
                ({confirmedSearch.type === 'logic' ? '논리명' : '물리명'})
              </span>
            </div>
          )}
        </div>

        {/* 우측단: 단어 목록 */}
        <div style={{ ...s.sectionStyle, flex: 1 }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginBottom: '10px'
          }}>
            <div style={s.titleFlexStyle}>
              <h3 style={{ ...s.titleStyle, margin: 0 }}>단어 목록</h3>
              <div style={s.countWrapperStyle}>
                <span style={s.dividerStyle}></span>
                <span>
                  검색결과 <b style={s.countNumberStyle}>{wordList.length.toLocaleString()}</b> 건
                </span>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '8px' }}>
              <button style={s.grayButtonStyle} onClick={() => alert('단어 등록')}>단어 등록</button>
              <button style={s.grayButtonStyle} onClick={() => alert('도메인 등록')}>도메인 등록</button>
            </div>
          </div>
          
          <div style={s.fiveGridStyle}>
            <table style={s.tableStyle}>
              <thead>
                <tr style={s.headerRowStyle}>
                  <th style={{ ...s.thStyle, width: '5%' }}>순번</th>
                  <th style={{ ...s.thStyle, width: '15%' }}>표준단어</th>
                  <th style={{ ...s.thStyle, width: '15%' }}>영어약어</th>
                  <th style={{ ...s.thStyle, width: '15%' }}>도메인여부</th>
                  <th style={s.thStyle}>영어전체명</th>
                </tr>
              </thead>
              <tbody>
                {wordList.length > 0 ? wordList.map((item, idx) => (
                  <tr key={idx} style={s.rowStyle}>
                    <td style={s.tdStyle}>{idx + 1}</td>
                    <td style={s.tdStyle}>{item.VOCABULARY_STANDARD_KNM}</td>
                    <td style={s.tdStyle}>{item.VOCABULARY_ABBREVIATION_ENM}</td>
                    <td style={s.tdStyle}>{item.VOCABULARY_DOMAIN_YN}</td>
                    <td style={s.tdStyle}>{item.VOCABULARY_ENTIRE_ENM}</td>
                  </tr>
                )) : <tr><td colSpan="5" style={s.emptyTdStyle}>조회 결과가 없습니다.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 하단: 용어 목록 */}
      <div style={s.sectionStyle}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '10px' 
        }}>
          <div style={s.titleFlexStyle}>
            <h3 style={{ ...s.titleStyle, margin: 0 }}>용어 목록</h3>
            <div style={s.countWrapperStyle}>
              <span style={s.dividerStyle}></span>
              <span>
                검색결과 <b style={s.countNumberStyle}>{terminologyList.length.toLocaleString()}</b> 건
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button style={s.grayButtonStyle} onClick={() => alert('용어 등록')}>용어 등록</button>
          </div>
        </div>

        <div style={s.tenGridStyle}>
          <table style={s.tableStyle}>
            <thead>
              <tr style={s.headerRowStyle}>
                <th style={{ ...s.thStyle, width: '5%' }}>순번</th>
                <th style={{ ...s.thStyle, width: '15%' }}>논리명</th>
                <th style={{ ...s.thStyle, width: '15%' }}>물리명</th>
                <th style={{ ...s.thStyle, width: '15%' }}>인포타입</th>
                <th style={s.thStyle}>용어정의</th>
              </tr>
            </thead>
            <tbody>
              {terminologyList.length > 0 ? terminologyList.map((item, idx) => (
                <tr 
                  key={idx} 
                  style={{ ...s.rowStyle, cursor: 'pointer' }} // 커서 모양 변경
                  onDoubleClick={() => onEdit(item)} // 더블클릭 시 편집 함수 호출
                  title="더블클릭 시 편집 화면으로 이동합니다"
                >
                  <td style={s.tdStyle}>{idx + 1}</td>
                  <td style={s.tdStyle}>{item.TERMINOLOGY_LOGIC_NM}</td>
                  <td style={s.tdStyle}>{item.TERMINOLOGY_PHYSIC_NM}</td>
                  <td style={s.tdStyle}>{item.DOMAIN_INFOTYPE_NM}</td>
                  <td style={s.tdStyle}>{item.TERMINOLOGY_DEFINITION_CON}</td>
                </tr>
              )) : <tr><td colSpan="5" style={s.emptyTdStyle}>조회 결과가 없습니다.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default TermSearch;