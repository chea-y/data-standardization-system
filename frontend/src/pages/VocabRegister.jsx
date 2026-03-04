import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import * as s from '../styles';

const labelStyle = { ...s.thStyle, width: '150px', backgroundColor: '#f8f9fa', textAlign: 'center' };
const inputCellStyle = { ...s.tdStyle, padding: '8px' };
const fullInputStyle = { ...s.inputStyle, width: '100%', boxSizing: 'border-box', display: 'block' };

function VocabRegister({ editData, setEditData }) {
  const [form, setForm] = useState({
    standardNm: '',      // 표준단어
    domainYn: 'N',       // 도메인여부
    abbrNm: '',          // 영문약어
    replaceWord: '',     // 단어대체어
    fullNm: '',          // 영어전체명
    definition: ''       // 단어정의
  });

  const [isEditing, setIsEditing] = useState(false);
  
  // --- 리스트업(자동완성) 관련 상태 ---
  const [suggestions, setSuggestions] = useState({ list: [], cursor: 0, show: false });
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  // 필드가 비어있는지 확인하는 헬퍼 함수
  const hasValue = (val) => val && val.toString().trim().length > 0;

  // [추가] 공통 입력창 스타일 계산 함수
  const getInputStyle = (fieldName) => {
    const value = form[fieldName];
    const filled = hasValue(value);

    return {
      ...fullInputStyle,
      // 1. 배경색: 수정 모드(불러오기 완료)일 때는 아주 연한 하늘색, 값이 직접 입력되면 흰색
      // backgroundColor: isEditing ? '#f0f7ff' : '#fff', 
      
      // 2. 테두리: 값이 있으면 파란색 계열, 없으면 기본 회색
      borderColor: filled ? '#4a90e2' : '#ddd',
      borderWidth: '1px',
      borderStyle: 'solid',
      
      // 3. 포커스 시 시각적 대비를 위한 트랜지션
      transition: 'all 0.2s ease-in-out',
      boxShadow: filled && isEditing ? 'inset 0 0 4px rgba(74, 144, 226, 0.1)' : 'none',
      
      outline: 'none',
    };
  };


  useEffect(() => {
    if (editData) {
      setForm({
        standardNm: editData.VOCABULARY_STANDARD_KNM || '',
        domainYn: editData.VOCABULARY_DOMAIN_YN || 'N',
        abbrNm: editData.VOCABULARY_ABBREVIATION_ENM || '',
        replaceWord: editData.VOCABULARY_ALTERNATIVE_NM || '',
        fullNm: editData.VOCABULARY_ENTIRE_ENM || '',
        definition: editData.VOCABULARY_DEFINITION_CON || ''
      });
      setIsEditing(true);
    }
    return () => { if (setEditData) setEditData(null); };
  }, [editData, setEditData]);


  const handleStandardNmChange = async (value) => {
    setForm(prev => ({ ...prev, standardNm: value }));

    setIsEditing(false); 

    if (value.trim()) { 
      try {
        // target: 'word' 파라미터를 유지하면서 검색
        const res = await axios.get(`http://localhost:8000/words`, { 
          params: { keyword: value, target: 'word' } 
        });
        setSuggestions({ list: res.data, cursor: 0, show: true });
      } catch (err) { 
        console.error(err); 
      }
    } else {
      setSuggestions({ list: [], cursor: 0, show: false });
    }
  };

  const selectWord = (wordObj) => {
    setForm({
      standardNm: wordObj.VOCABULARY_STANDARD_KNM,
      domainYn: wordObj.VOCABULARY_DOMAIN_YN || 'N',
      abbrNm: wordObj.VOCABULARY_ABBREVIATION_ENM,
      replaceWord: wordObj.VOCABULARY_ALTERNATIVE_NM || '',
      fullNm: wordObj.VOCABULARY_ENTIRE_ENM,
      definition: wordObj.VOCABULARY_DEFINITION_CON
    });
    setSuggestions({ list: [], cursor: 0, show: false });
    setIsEditing(true); // 기존 단어 선택 시 수정 모드로 전환
  };

  const handleKeyDown = (e) => {
    if (!suggestions.show || suggestions.list.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSuggestions(prev => ({ ...prev, cursor: Math.min(prev.cursor + 1, prev.list.length - 1) }));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSuggestions(prev => ({ ...prev, cursor: Math.max(prev.cursor - 1, 0) }));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      selectWord(suggestions.list[suggestions.cursor]);
    } else if (e.key === 'Escape') {
      setSuggestions({ list: [], cursor: 0, show: false });
    }
  };

  // --- 버튼 액션 ---
  const handleClear = useCallback(() => {
    setForm({ standardNm: '', domainYn: 'N', abbrNm: '', replaceWord: '', fullNm: '', definition: '' });
    setIsEditing(false);
    setSuggestions({ list: [], cursor: 0, show: false });
    if (setEditData) setEditData(null);
  }, [setEditData]);

  // 저장버튼 관련
  const handleSave = async () => {
    if (!form.standardNm.trim()) {
      Swal.fire(s.swalError('입력 오류', '표준단어명을 입력해주세요.'));
      return;
    }

    // 로딩 시작
    Swal.fire(s.swalLoading('데이터 저장 중...'));

    try {
      await axios.post(`http://localhost:8000/save_word`, form);
      
      // 저장 완료 (확인 버튼 눌러야 닫힘)
      await Swal.fire(s.swalSuccess('저장 완료', '성공적으로 저장되었습니다.'));
      
      handleClear();
    } catch (err) {
      Swal.fire(s.swalError('저장 실패', '서버 통신 중 오류가 발생했습니다.'));
    }
  };

  const handleDelete = async () => {
    // 삭제 확인 팝업
    const result = await Swal.fire(s.swalDeleteConfirm());

    if (result.isConfirmed) {
      try {
        await axios.delete(`http://localhost:8000/delete_word/${form.standardNm}`);
        await Swal.fire(s.swalSuccess('삭제 완료', '데이터가 삭제되었습니다.'));
        handleClear();
      } catch (err) {
        Swal.fire(s.swalError('삭제 실패', '삭제 중 오류가 발생했습니다.'));
      }
    }
  };

  return (
    <div style={s.containerStyle}>
      <div style={s.titleContainerStyle}>
        <h1 style={s.mainTitleStyle}>단어 등록</h1>
        <span style={s.subTitleStyle}>- 한글을 영문화하여 대표 자음으로 약식 표현한 말</span>
      </div>

      <div style={{ ...s.sectionStyle, maxWidth: '1000px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <h3 style={s.titleStyle}>[ 단어 등록 ]</h3>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button style={s.blueButtonStyle} onClick={handleSave}>저장</button>
            <button 
              style={{ ...s.blueButtonStyle, backgroundColor: isEditing ? '#ff4d4f' : '#e0e0e0', color: isEditing ? 'white' : '#666' }} 
              onClick={() => isEditing && handleDelete()}
              disabled={!isEditing}
            >삭제</button>
            <button style={s.clearButtonStyle} onClick={handleClear}>초기화</button>
          </div>
        </div>

        <table style={{ ...s.tableStyle, borderCollapse: 'collapse', border: '1px solid #ddd', tableLayout: 'fixed' }}>
          <tbody>
            <tr>
              <th style={labelStyle}>표준단어</th>
              <td style={{ ...inputCellStyle, position: 'relative', overflow: 'visible', zIndex: 10 }}>
                <input 
                  ref={inputRef}
                  style={getInputStyle('standardNm')} // 함수형 스타일 적용
                  value={form.standardNm} 
                  onChange={(e) => handleStandardNmChange(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onBlur={() => setTimeout(() => setSuggestions(p => ({ ...p, show: false })), 200)}
                  placeholder="예) 응급"
                  autoComplete="off"
                />
                
                {/* 리스트업 드롭다운 영역 */}
                {suggestions.show && suggestions.list.length > 0 && (
                  <div 
                    ref={dropdownRef} 
                    style={{ 
                      position: 'absolute', 
                      top: '100%',     // 입력창 바로 아래
                      left: 0,         // 왼쪽 정렬
                      width: '100%',   // 입력창 너비와 동일하게
                      backgroundColor: '#fff', 
                      border: '1px solid #4a90e2', 
                      zIndex: 9999,    // [중요] 최상위 레이어
                      boxShadow: '0 4px 8px rgba(0,0,0,0.15)', // 그림자 진하게
                      maxHeight: '200px', 
                      overflowY: 'auto' 
                    }}
                  >
                    {suggestions.list.map((item, i) => (
                      <div 
                        key={i} 
                        style={{ 
                          padding: '10px 12px', 
                          cursor: 'pointer', 
                          fontSize: '13px', 
                          backgroundColor: i === suggestions.cursor ? '#eef6ff' : '#fff', 
                          borderBottom: '1px solid #eee',
                          color: '#333' // 글자색 명시
                        }}
                        onMouseDown={(e) => {
                          e.preventDefault(); // 블러 이벤트 방지
                          selectWord(item);
                        }}
                        onMouseEnter={() => setSuggestions(prev => ({ ...prev, cursor: i }))}
                      >
                        <div style={{ fontWeight: 'bold', marginBottom: '2px' }}>
                          {item.VOCABULARY_STANDARD_KNM}
                        </div>
                        <div style={{ fontSize: '11px', color: '#666' }}>
                          {item.VOCABULARY_ABBREVIATION_ENM} | {item.VOCABULARY_ENTIRE_ENM}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </td>
              <th style={labelStyle}>도메인여부</th>
              <td style={inputCellStyle}>
                <select 
                  style={getInputStyle('domainYn')} 
                  value={form.domainYn} 
                  onChange={(e) => setForm({ ...form, domainYn: e.target.value })}
                >
                  <option value="N">미사용 (N)</option>
                  <option value="Y">사용 (Y)</option>
                </select>
              </td>
            </tr>
            <tr>
              <th style={labelStyle}>영문약어</th>
              <td style={inputCellStyle}>
                <input 
                  style={getInputStyle('abbrNm')} 
                  value={form.abbrNm} 
                  onChange={(e) => setForm({ ...form, abbrNm: e.target.value })} 
                  placeholder="예) ER"
                />
              </td>
              <th style={labelStyle}>단어대체어</th>
              <td style={inputCellStyle}>
                <input 
                  style={getInputStyle('replaceWord')} 
                  value={form.replaceWord} 
                  onChange={(e) => setForm({ ...form, replaceWord: e.target.value })} 
                  placeholder="예) 긴급"
                />
              </td>
            </tr>
            <tr>
              <th style={labelStyle}>영어전체명</th>
              <td colSpan="3" style={inputCellStyle}>
                <input 
                  style={getInputStyle('fullNm')} 
                  value={form.fullNm} 
                  onChange={(e) => setForm({ ...form, fullNm: e.target.value })} 
                  placeholder="예) EMERGENCY"
                />
              </td>
            </tr>
            <tr>
              <th style={labelStyle}>단어정의</th>
              <td colSpan="3" style={inputCellStyle}>
                <textarea 
                  style={{ 
                    ...getInputStyle('definition'), // 공통 스타일 적용
                    height: '80px', 
                    resize: 'none', 
                    padding: '7px 10px', 
                    fontFamily: 'sans-serif', 
                    fontSize: '14px',
                  }} 
                  value={form.definition} 
                  onChange={(e) => setForm({ ...form, definition: e.target.value })} 
                  placeholder="정의를 입력하세요." 
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default VocabRegister;