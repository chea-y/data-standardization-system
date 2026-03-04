import React, { useState, useRef } from 'react';
import axios from 'axios';
import * as s from '../styles';

// { onEdit } 프롭스를 반드시 받아야 합니다.
function VocabSearch({ onEdit }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState('word');
  const [vocabList, setVocabList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [confirmedSearch, setConfirmedSearch] = useState({ term: '', type: '' });
  
  const inputRef = useRef(null);

  const handleSearch = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:8000/words`, {
        params: { 
          keyword: searchTerm, 
          target: searchType 
        }
      });
      setVocabList(response.data);
      setConfirmedSearch({ term: searchTerm, type: searchType });
    } catch (err) {
      console.error(err);
      alert("단어 데이터 로드 실패");
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
    if (searchType === 'word') return "표준 단어명 입력";
    if (searchType === 'abbr') return "영문 약어 입력";
    return "영어 전체명 입력";
  };

  return (
    <div style={s.containerStyle}>
      <div style={s.titleContainerStyle}>
        <h1 style={s.mainTitleStyle}>단어 조회</h1>
        <span style={s.subTitleStyle}>- 한글을 영문화하여 대표 자음으로 약식 표현한 말</span>
      </div>

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

        <div style={s.radioGroupStyle}>
          <label style={s.radioLabelStyle}>
            <input type="radio" checked={searchType === 'word'} onChange={() => handleTypeChange('word')} /> 표준단어명 기준
          </label>
          <label style={s.radioLabelStyle}>
            <input type="radio" checked={searchType === 'abbr'} onChange={() => handleTypeChange('abbr')} /> 영문약어 기준
          </label>
          <label style={s.radioLabelStyle}>
            <input type="radio" checked={searchType === 'full'} onChange={() => handleTypeChange('full')} /> 영어 전체명 기준
          </label>
        </div>

        {confirmedSearch.type && (
          <div style={{ 
            marginTop: '15px', padding: '12px', borderLeft: '4px solid #0056b3', 
            backgroundColor: '#eef6ff', borderRadius: '0 4px 4px 0', fontSize: '14px'
          }}>
            <span style={{ color: '#555', fontWeight: 'bold' }}>조회 키워드 : </span>
            <span style={{ color: '#0056b3', fontSize: '20px', fontWeight: '800', marginLeft: '5px' }}>
              {confirmedSearch.term ? `" ${confirmedSearch.term} "` : '(전체 항목)'}
            </span>
          </div>
        )}
      </div>

      <div style={s.sectionStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          {/* 왼쪽 영역 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h3 style={{ ...s.titleStyle, margin: 0 }}>[ 단어 목록 ]</h3>
            <div style={s.countWrapperStyle}>
              <span style={s.dividerStyle}></span>
              <span>
                검색결과 <b style={s.countNumberStyle}>{(vocabList || []).length.toLocaleString()}</b> 건
              </span>
            </div>
          </div>

          {/* 오른쪽 영역:버튼 */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <button style={s.grayButtonStyle} onClick={() => alert('단어 등록')}>단어 등록</button>
            <button style={s.grayButtonStyle} onClick={() => alert('도메인 등록')}>도메인 등록</button>
          </div>
        </div>

        <div style={s.tenGridStyle}>
          <table style={s.tableStyle}>
            <thead>
              <tr style={s.headerRowStyle}>
                <th style={{ ...s.thStyle, width: '5%' }}>순번</th>
                <th style={{ ...s.thStyle, width: '15%' }}>표준단어명</th>
                <th style={{ ...s.thStyle, width: '15%' }}>영문약어</th>
                <th style={{ ...s.thStyle, width: '5%' }}>도메인여부</th>
                <th style={{ ...s.thStyle, width: '20%' }}>영문전체명(Full Name)</th>
                <th style={s.thStyle}>단어정의</th>
              </tr>
            </thead>
            <tbody>
              {vocabList.length > 0 ? vocabList.map((vocab, idx) => (
                <tr 
                  key={idx} 
                  style={{ ...s.rowStyle, cursor: 'pointer' }}
                  onDoubleClick={() => onEdit(vocab)} // 여기서 상위로 데이터 전달
                  title="더블클릭 시 수정 페이지로 이동"
                >
                  <td style={s.tdStyle}>{idx + 1}</td>
                  <td style={{ ...s.tdStyle, fontWeight: 'bold' }}>{vocab.VOCABULARY_STANDARD_KNM}</td>
                  <td style={s.tdStyle}>{vocab.VOCABULARY_ABBREVIATION_ENM}</td>
                  <td style={{ ...s.tdStyle, textAlign: 'center' }}>{vocab.VOCABULARY_DOMAIN_YN}</td>
                  <td style={s.tdStyle}>{vocab.VOCABULARY_ENTIRE_ENM}</td>
                  <td style={s.tdStyle}>{vocab.VOCABULARY_DEFINITION_CON}</td>
                </tr>
              )) : (
                <tr><td colSpan="6" style={s.emptyTdStyle}>조회된 단어가 없습니다.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default VocabSearch;