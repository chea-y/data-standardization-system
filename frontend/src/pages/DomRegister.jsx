import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import * as s from '../styles';

const labelStyle = { ...s.thStyle, width: '150px', backgroundColor: '#f8f9fa', textAlign: 'center' };
const inputCellStyle = { ...s.tdStyle, padding: '8px' };
const fullInputStyle = { ...s.inputStyle, width: '100%', boxSizing: 'border-box', display: 'block' };

// 
const safeString = (val) => (val === null || val === undefined) ? '' : String(val);

function DomRegister({ editData, setEditData }) {
  const [form, setForm] = useState({
    domainGroupNm: '',
    domainNm: '',
    domainTcd: '',
    domainLen: '',
    domainPrecisionLen: '',
    domainDefinitionCon: '',
    infoTypeNm: ''
  });

  const [domainGroups, setDomainGroups] = useState([]);
  const [suggestions, setSuggestions] = useState({ list: [], show: false, cursor: -1 });
  const [isEditing, setIsEditing] = useState(false);

  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  const typeMap = {
    VC: 'STRING', NM: 'NUMBER', DT: 'DATE',
    TM: 'TIMESTAMP', CL: 'CLOB', BL: 'BLOB',
    XML : 'XML', LI : 'LIST'
  };

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const res = await axios.get('http://localhost:8000/domain_list');
        const groups = [...new Set(res.data.map(item => item.DOMAIN_GROUP_NM))];
        setDomainGroups(groups);
      } catch (err) { console.error("그룹 로드 실패", err); }
    };
    fetchGroups();
  }, []);

  // 
  useEffect(() => {
    if (editData) {
      setForm({
        domainGroupNm: safeString(editData.DOMAIN_GROUP_NM),
        domainNm: safeString(editData.DOMAIN_NM),
        domainTcd: safeString(editData.DOMAIN_TCD),
        domainLen: safeString(editData.DOMAIN_LEN),
        domainPrecisionLen: safeString(editData.DOMAIN_PRECISION_LEN),
        domainDefinitionCon: safeString(editData.DOMAIN_DEFINITION_CON),
        infoTypeNm: safeString(editData.DOMAIN_INFOTYPE_NM)
      });
      setIsEditing(true);
    }
  }, [editData]);

  // 
  useEffect(() => {
    if (!isEditing) {
      const nm = form.domainNm || '';
      const tcd = form.domainTcd || '';
      const len = form.domainLen || '';
      let generated = `${nm}${tcd}${len}`;
      
      if (form.domainTcd === 'NM' && form.domainPrecisionLen) {
        generated += `,${form.domainPrecisionLen}`;
      }
      setForm(prev => ({ ...prev, infoTypeNm: generated }));
    }
  }, [form.domainNm, form.domainTcd, form.domainLen, form.domainPrecisionLen, isEditing]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    
    if (name === 'domainNm') {
      if (!value.trim()) {
        setSuggestions({ list: [], show: false, cursor: -1 });
        setIsEditing(false); 
        return;
      }
      setIsEditing(false); // 이름을 수정하는 순간 신규 등록 모드로 전환됨
      fetchDomainSuggestions(value);
    }
  };

  const fetchDomainSuggestions = async (val) => {
    try {
      const res = await axios.get(`http://localhost:8000/domains`, { params: { keyword: val, target: 'domain' } });
      setSuggestions({ list: res.data, show: res.data.length > 0, cursor: -1 });
    } catch (err) { console.error(err); }
  };

  // 
  const selectExistingDomain = (dom) => {
    setForm({
      domainGroupNm: safeString(dom.DOMAIN_GROUP_NM),
      domainNm: safeString(dom.DOMAIN_NM),
      domainTcd: safeString(dom.DOMAIN_TCD),
      domainLen: safeString(dom.DOMAIN_LEN),
      domainPrecisionLen: safeString(dom.DOMAIN_PRECISION_LEN),
      domainDefinitionCon: safeString(dom.DOMAIN_DEFINITION_CON),
      infoTypeNm: safeString(dom.DOMAIN_INFOTYPE_NM)
    });
    setSuggestions({ list: [], show: false, cursor: -1 });
    setIsEditing(true);
  };

  const handleClear = () => {
    setForm({ domainGroupNm: '', domainNm: '', domainTcd: '', domainLen: '', domainPrecisionLen: '', domainDefinitionCon: '', infoTypeNm: '' });
    setIsEditing(false);
    setSuggestions({ list: [], show: false, cursor: -1 });
    if (setEditData) setEditData(null);
  };

  const handleSave = async () => {
    if (!form.domainNm || !form.domainGroupNm || !form.domainTcd) {
      return Swal.fire(s.swalError("필수 입력 누락", "도메인명, 그룹, 유형을 모두 선택해주세요."));
    }

    Swal.fire(s.swalLoading("저장 중..."));

    try {
      await axios.post('http://localhost:8000/save_domain', form);
      Swal.fire(s.swalSuccess("저장 완료", `'${form.domainNm}' 도메인이 저장되었습니다.`));
      handleClear();
    } catch (err) {
      console.error(err); // 콘솔에 에러 원인 출력
      Swal.fire(s.swalError("저장 실패", "데이터베이스 저장 중 오류가 발생했습니다."));
    }
  };

  const handleDelete = async () => {
    if (!isEditing) return;

    const result = await Swal.fire(s.swalDeleteConfirm(
      "도메인 삭제",
      `'${form.domainNm}' 도메인을 정말 삭제하시겠습니까?`
    ));

    if (result.isConfirmed) {
      Swal.fire(s.swalLoading("삭제 중..."));
      try {
        await axios.delete(`http://localhost:8000/delete_domain/${encodeURIComponent(form.domainNm)}`);
        Swal.fire(s.swalSuccess("삭제 완료", "데이터가 제거되었습니다."));
        handleClear();
      } catch (err) {
        Swal.fire(s.swalError("삭제 실패", "삭제 작업 중 문제가 발생했습니다."));
      }
    }
  };

  const handleKeyDown = (e) => {
    if (!suggestions.show || suggestions.list.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSuggestions(prev => ({ ...prev, cursor: prev.cursor < prev.list.length - 1 ? prev.cursor + 1 : prev.cursor }));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSuggestions(prev => ({ ...prev, cursor: prev.cursor > 0 ? prev.cursor - 1 : 0 }));
    } else if (e.key === 'Enter') {
      if (suggestions.cursor >= 0) selectExistingDomain(suggestions.list[suggestions.cursor]);
    } else if (e.key === 'Escape') {
      setSuggestions(prev => ({ ...prev, show: false }));
    }
  };

  useEffect(() => {
    return () => { if (setEditData) setEditData(null); };
  }, [setEditData]);

  return (
    <div style={s.containerStyle}>
      <div style={s.titleContainerStyle}>
        <h1 style={s.mainTitleStyle}>도메인 등록</h1>
        <span style={s.subTitleStyle}>- 용어의 유형과 길이, 성격 등을 규정짓는 집합체</span>
      </div>

      <div style={{ ...s.sectionStyle, maxWidth: '1000px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <h3 style={s.titleStyle}>[ 도메인 등록 ]</h3>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button style={s.blueButtonStyle} onClick={handleSave}>저장</button>
            <button 
              style={{ 
                ...s.blueButtonStyle, 
                backgroundColor: isEditing ? '#ff4d4f' : '#e0e0e0', 
                color: isEditing ? 'white' : '#666',
                cursor: isEditing ? 'pointer' : 'not-allowed'
              }} 
              onClick={handleDelete}
              disabled={!isEditing}
            >
              삭제
            </button>
            <button style={s.clearButtonStyle} onClick={handleClear}>초기화</button>
          </div>
        </div>

        <table style={{ ...s.tableStyle, borderCollapse: 'collapse', tableLayout: 'fixed' }}>
          <tbody>
            <tr>
              <th style={labelStyle}>도메인</th>
              <td style={{ ...inputCellStyle, position: 'relative', overflow: 'visible', zIndex: 10 }}>
                <input 
                  name="domainNm"
                  ref={inputRef}
                  style={{ ...fullInputStyle, backgroundColor: isEditing ? '#f0faff' : '#fff' }} 
                  value={form.domainNm} 
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  onBlur={() => setTimeout(() => setSuggestions(p => ({ ...p, show: false })), 200)}
                  placeholder="도메인명"
                  autoComplete="off"
                />
                
                {suggestions.show && (
                  <div style={s.suggestionBoxStyle}>
                    {suggestions.list.map((item, i) => (
                      <div key={i} 
                        style={{ 
                          ...s.suggestionItemStyle, 
                          backgroundColor: i === suggestions.cursor ? '#eef6ff' : '#fff' 
                        }} 
                        onMouseDown={(e) => { e.preventDefault(); selectExistingDomain(item); }}
                      >
                        <div style={{ fontWeight: 'bold' }}>{item.DOMAIN_NM}</div>
                        <div style={{ fontSize: '11px', color: '#666' }}>
                          {item.DOMAIN_INFOTYPE_NM} | {item.DOMAIN_GROUP_NM}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </td>
              <th style={labelStyle}>도메인 그룹</th>
              <td style={inputCellStyle}>
                <select name="domainGroupNm" style={fullInputStyle} value={form.domainGroupNm} onChange={handleInputChange}>
                  <option value="">-- 그룹 선택 --</option>
                  {domainGroups.map((g, i) => <option key={i} value={g}>{g}</option>)}
                </select>
              </td>
            </tr>
            <tr>
              <th style={labelStyle}>도메인 유형</th>
              <td style={inputCellStyle}>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <select 
                    name="domainTcd" 
                    style={s.customSelect} // 분리한 스타일 적용
                    value={form.domainTcd} 
                    onChange={handleInputChange}
                    // 포커스 이벤트 처리
                    onFocus={(e) => Object.assign(e.target.style, s.selectFocus)}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#d9d9d9';
                      e.target.style.boxShadow = 'none';
                    }}
                  >
                    <option value="">-- 유형 선택 --</option>
                    {Object.keys(typeMap).map(t => (
                      <option key={t} value={t}>{t} ({typeMap[t]})</option>
                    ))}
                  </select>

                  {/* 우측 타입 자동 표시창 */}
                  <div style={{ width: '60%' }}>
                    <input 
                      style={s.readOnlyInput} 
                      value={typeMap[form.domainTcd] || ''} 
                      readOnly 
                      placeholder="타입 자동 표시"
                    />
                  </div>
                </div>
              </td>
              <th style={labelStyle}>도메인 길이</th>
              <td style={inputCellStyle}>
                <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                  <input name="domainLen" type="number" style={{ ...fullInputStyle, width: '40%' }} value={form.domainLen} onChange={handleInputChange} />
                  <span style={{ fontSize: '12px' }}>소수점:</span>
                  <input 
                    name="domainPrecisionLen" 
                    type="number" 
                    style={{ ...fullInputStyle, width: '30%', backgroundColor: form.domainTcd === 'NM' ? '#fff' : '#f5f5f5' }} 
                    value={form.domainPrecisionLen} 
                    onChange={handleInputChange} 
                    disabled={form.domainTcd !== 'NM'} 
                  />
                </div>
              </td>
            </tr>
            <tr>
              <th style={labelStyle}>인포타입명</th>
              <td colSpan="3" style={inputCellStyle}>
                <input style={{ ...fullInputStyle, backgroundColor: '#f0faff', fontWeight: 'bold' }} value={form.infoTypeNm} readOnly />
              </td>
            </tr>
            <tr>
              <th style={labelStyle}>도메인 정의</th>
              <td colSpan="3" style={inputCellStyle}>
                <textarea 
                  name="domainDefinitionCon" 
                  style={{ ...fullInputStyle, height: '80px', resize: 'none' }} 
                  value={form.domainDefinitionCon} 
                  onChange={handleInputChange} 
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default DomRegister;