import React, { useState, useRef } from 'react';
import axios from 'axios';
import * as s from '../styles';

function DomSearch({ onEdit }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState('domain'); // 'domain', 'group'
  const [domList, setDomList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [confirmedSearch, setConfirmedSearch] = useState({ term: '', type: '' });
  
  const inputRef = useRef(null);

  const handleSearch = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:8000/domains`, {
        params: { 
          keyword: searchTerm, 
          target: searchType 
        }
      });
      console.log("백엔드에서 온 데이터:", response.data);
      
      setDomList(response.data);
      setConfirmedSearch({ term: searchTerm, type: searchType });
    } catch (err) {
      console.error(err);
      alert("도메인 데이터 로드 실패");
    } finally {
      setLoading(false);
    }
  };

  const handleTypeChange = (type) => {
    setSearchType(type);
    setSearchTerm('');
    setTimeout(() => inputRef.current?.focus(), 10);
  };

  const getPlaceholder = () => {
    if (searchType === 'domain') return "도메인명 입력";
    return "도메인 그룹명 입력";
  };


  


  return (
    <div style={s.containerStyle}>
      {/* 1. 타이틀 영역 */}
      <div style={s.titleContainerStyle}>
        <h1 style={s.mainTitleStyle}>도메인 조회</h1>
        <span style={s.subTitleStyle}>
          - 용어의 유형과 길이, 성격 등을 규정짓는 집합체
        </span>
      </div>

      {/* 2. 상단 영역: 검색 조건 */}
      <div style={{ ...s.sectionStyle, width: '450px' }}>
        <h3 style={s.titleStyle}>[ 검색 조건 ]</h3>
        
        <div style={s.searchBarStyle}>
          <strong>검색어 : </strong>
          <input 
            ref={inputRef}
            autoFocus
            type="text" 
            value={searchTerm}
            placeholder={getPlaceholder()} 
            style={s.inputStyle}
            onChange={(e) => setSearchTerm(e.target.value)}
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

        {/* 라디오 버튼 2종 */}
        <div style={s.radioGroupStyle}>
          <label style={s.radioLabelStyle}>
            <input type="radio" checked={searchType === 'domain'} onChange={() => handleTypeChange('domain')} /> 도메인명 기준
          </label>
          <label style={s.radioLabelStyle}>
            <input type="radio" checked={searchType === 'group'} onChange={() => handleTypeChange('group')} /> 도메인 그룹명 기준
          </label>
        </div>

        {/* 조회 키워드 요약 */}
        {confirmedSearch.type && (
          <div style={{ 
            marginTop: '15px', padding: '12px', borderLeft: '4px solid #0056b3', 
            backgroundColor: '#eef6ff', borderRadius: '0 4px 4px 0', fontSize: '14px',
            animation: 'fadeIn 0.5s ease-in' 
          }}>
            <span style={{ color: '#555', fontWeight: 'bold' }}>조회 키워드 : </span>
            <span style={{ color: '#0056b3', fontSize: '20px', fontWeight: '800', marginLeft: '5px' }}>
              {confirmedSearch.term ? `" ${confirmedSearch.term} "` : '(전체 항목)'}
            </span>
            <span style={{ color: '#777', fontSize: '12px', marginLeft: '5px' }}>
              ({confirmedSearch.type === 'domain' ? '도메인명' : '도메인그룹'})
            </span>
          </div>
        )}
      </div>

      {/* 3. 하단 영역: 도메인 목록 */}
      <div style={s.sectionStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          {/* 왼쪽 영역 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h3 style={{ ...s.titleStyle, margin: 0 }}>[ 도메인 목록 ]</h3>
            <div style={s.countWrapperStyle}>
              <span style={s.dividerStyle}></span>
              <span>
                검색결과 <b style={s.countNumberStyle}>{(domList || []).length.toLocaleString()}</b> 건
              </span>
            </div>
          </div>

          {/* 오른쪽 영역: 버튼 */}
          <button style={s.grayButtonStyle} onClick={() => alert('도메인 신규 등록 창 열기')}>
            도메인 등록
          </button>
        </div>

        <div style={s.tenGridStyle}>
          <table style={s.tableStyle}>
            <thead>
              <tr style={s.headerRowStyle}>
                <th style={{ ...s.thStyle, width: '5%' }}>순번</th>
                <th style={{ ...s.thStyle, width: '20%' }}>도메인그룹</th>
                <th style={{ ...s.thStyle, width: '20%' }}>도메인명</th>
                <th style={{ ...s.thStyle, width: '20%' }}>인포타입(ID)</th>
                <th style={s.thStyle}>도메인정의</th>
              </tr>
            </thead>
            <tbody>
              {domList.length > 0 ? domList.map((dom, idx) => (
                <tr 
                  key={idx} 
                  style={{ ...s.rowStyle, cursor: 'pointer' }}
                  onDoubleClick={() => onEdit && onEdit(dom)}
                >
                  <td style={s.tdStyle}>{idx + 1}</td>
                  <td style={s.tdStyle}>{dom.DOMAIN_GROUP_NM}</td>
                  <td style={{ ...s.tdStyle, fontWeight: 'bold' }}>{dom.DOMAIN_NM}</td>
                  <td style={s.tdStyle}>{dom.DOMAIN_INFOTYPE_NM}</td>
                  <td style={s.tdStyle}>{dom.DOMAIN_DEFINITION_CON}</td>
                </tr>
              )) : (
                <tr><td colSpan="5" style={s.emptyTdStyle}>조회된 도메인이 없습니다.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default DomSearch;