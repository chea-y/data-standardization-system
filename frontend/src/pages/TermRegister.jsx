import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import * as s from '../styles';

// 공통 적용 스타일 
const commonInputStyle = { ...s.inputStyle, width: '100%', boxSizing: 'border-box', display: 'block' };

function TerminologyAdd({ editData, setEditData }) {
  // --- 상태 관리  ---
  const [logicWords, setLogicWords] = useState(Array(6).fill(''));
  const [physicWords, setPhysicWords] = useState(Array(6).fill(''));
  const [isVerified, setIsVerified] = useState(Array(6).fill(false));
  
  const [suggestions, setSuggestions] = useState({ idx: null, list: [], cursor: 0 });
  const [isExisting, setIsExisting] = useState(false);
  const [allDomains, setAllDomains] = useState([]); 
  const [filteredDomains, setFilteredDomains] = useState([]); 
  const [filteredInfoTypes, setFilteredInfoTypes] = useState([]); 
  const [terminologyList, setTerminologyList] = useState([]);
  const inputRefs = useRef([]);
  
  const [form, setForm] = useState({
    physicNm: '',
    domainGroup: '',
    domain: '',
    infoType: '',
    definition: ''
  });

  const isEditingRef = useRef(false);
  const infoTypeRef = useRef(null);
  const dropdownRef = useRef(null);
  const [refreshLog, setRefreshLog] = useState(0);

  // --- 기존 로직 유지 ---
  useEffect(() => {
    if (editData) { handleEdit(editData); }
    return () => { if (setEditData) { setEditData(null); } };
  }, [editData, setEditData]);

  useEffect(() => {
    axios.get('http://localhost:8000/domain_list').then(res => setAllDomains(res.data));
    axios.get('http://localhost:8000/terminology_list').then(res => setTerminologyList(res.data));
  }, [refreshLog]);

  useEffect(() => {
    const combined = physicWords.filter(w => w).join('_').toUpperCase();
    setForm(prev => ({ ...prev, physicNm: combined }));
  }, [physicWords]);

  const handleClear = useCallback(() => {
    setLogicWords(Array(6).fill(''));
    setPhysicWords(Array(6).fill(''));
    setIsVerified(Array(6).fill(false)); 
    setForm({ physicNm: '', domainGroup: '', domain: '', infoType: '', definition: '' });
    setIsExisting(false);
    setSuggestions({ idx: null, list: [], cursor: 0 });
    setFilteredDomains([]);
    setFilteredInfoTypes([]);
    isEditingRef.current = false;
    setTimeout(() => inputRefs.current[0]?.focus(), 10);
  }, []);

  useEffect(() => {
    if (!form.physicNm || isEditingRef.current) { 
      if (!form.physicNm) setIsExisting(false); 
      return; 
    }
    const checkDuplicate = async () => {
      try {
        const res = await axios.get(`http://localhost:8000/terminology_detail/${form.physicNm}`);
        if (res.data) {
          const data = res.data;
          setIsExisting(true);
          updateCascadingSelectors(data.DOMAIN_GROUP_NM, data.DOMAIN_NM);
          setForm(prev => ({
            ...prev,
            domainGroup: data.DOMAIN_GROUP_NM,
            domain: data.DOMAIN_NM,
            infoType: data.DOMAIN_INFOTYPE_NM,
            definition: data.TERMINOLOGY_DEFINITION_CON
          }));
        } else {
          if (isExisting) { 
            setIsExisting(false);
            setForm(prev => ({ ...prev, domainGroup: '', domain: '', infoType: '', definition: '' }));
            setFilteredDomains([]);
            setFilteredInfoTypes([]);
          }
        }
      } catch (err) { console.error("중복 체크 오류", err); }
    };
    const timer = setTimeout(checkDuplicate, 300);
    return () => clearTimeout(timer);
  }, [form.physicNm, isExisting]); 

  const updateCascadingSelectors = (groupNm, domainNm = '') => {
    const domains = [...new Set(allDomains.filter(d => d.DOMAIN_GROUP_NM === groupNm).map(d => d.DOMAIN_NM))];
    setFilteredDomains(domains);
    if (domainNm) {
      const types = allDomains.filter(d => d.DOMAIN_GROUP_NM === groupNm && d.DOMAIN_NM === domainNm).map(d => d.DOMAIN_INFOTYPE_NM);
      setFilteredInfoTypes(types);
    }
  };

  const handleEdit = async (item) => {
    try {
      isEditingRef.current = true;
      handleClear(); 
      const res = await axios.get(`http://localhost:8000/terminology_detail/${item.TERMINOLOGY_PHYSIC_NM}`);
      const data = res.data;
      if (!data) return;
      const rawLogics = [data.TERMINOLOGY_LOGIC1_NM, data.TERMINOLOGY_LOGIC2_NM, data.TERMINOLOGY_LOGIC3_NM, data.TERMINOLOGY_LOGIC4_NM, data.TERMINOLOGY_LOGIC5_NM].filter(val => val && val.trim() !== '');
      const rawPhysics = data.TERMINOLOGY_PHYSIC_NM ? data.TERMINOLOGY_PHYSIC_NM.split('_') : [];
      const nextLogics = Array(6).fill('');
      const nextPhysics = Array(6).fill('');
      const nextVerified = Array(6).fill(false);
      rawLogics.forEach((val, idx) => { if (idx < 6) { nextLogics[idx] = val; nextVerified[idx] = true; nextPhysics[idx] = rawPhysics[idx] || ''; } });
      setLogicWords(nextLogics);
      setPhysicWords(nextPhysics);
      setIsVerified(nextVerified);
      setIsExisting(true);
      setForm({ physicNm: data.TERMINOLOGY_PHYSIC_NM, domainGroup: data.DOMAIN_GROUP_NM || '', domain: data.DOMAIN_NM || '', infoType: data.DOMAIN_INFOTYPE_NM, definition: data.TERMINOLOGY_DEFINITION_CON || '' });
      updateCascadingSelectors(data.DOMAIN_GROUP_NM, data.DOMAIN_NM);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) { console.error("수정 오류:", err); } finally { setTimeout(() => { isEditingRef.current = false; }, 500); }
  };

  const handleWordInputChange = async (idx, value) => {
    const newLogic = [...logicWords]; newLogic[idx] = value; setLogicWords(newLogic);
    const newVer = [...isVerified]; newVer[idx] = false; setIsVerified(newVer);
    if (value.trim()) {
      try { const res = await axios.get(`http://localhost:8000/words`, { params: { keyword: value } }); setSuggestions({ idx, list: res.data, cursor: 0 }); } catch (err) { console.error(err); }
    } else {
      setSuggestions({ idx: null, list: [], cursor: 0 });
      const newPhysic = [...physicWords]; newPhysic[idx] = ''; setPhysicWords(newPhysic);
    }
  };

  const selectWord = (idx, wordObj) => {
    const newLogic = [...logicWords], newPhysic = [...physicWords], newVer = [...isVerified];
    newLogic[idx] = wordObj.VOCABULARY_STANDARD_KNM; newPhysic[idx] = wordObj.VOCABULARY_ABBREVIATION_ENM; newVer[idx] = true;
    setLogicWords(newLogic); setPhysicWords(newPhysic); setIsVerified(newVer);
    setSuggestions({ idx: null, list: [], cursor: 0 });
    if (idx < 5) setTimeout(() => { inputRefs.current[idx + 1]?.focus(); }, 10);
  };

  const handleKeyDown = (e, idx) => {
    if (suggestions.idx !== idx || suggestions.list.length === 0) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); setSuggestions(prev => ({ ...prev, cursor: Math.min(prev.cursor + 1, prev.list.length - 1) })); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setSuggestions(prev => ({ ...prev, cursor: Math.max(prev.cursor - 1, 0) })); }
    else if (e.key === 'Enter') { e.preventDefault(); selectWord(idx, suggestions.list[suggestions.cursor]); }
    else if (e.key === 'Escape') { setSuggestions({ idx: null, list: [], cursor: 0 }); }
  };

  const handleSave = async () => {
    // 유효성 검사 (기존 유지)
    const hasUnverified = logicWords.some((word, i) => word.trim() !== '' && !isVerified[i]);
    if (hasUnverified) return Swal.fire(s.swalError("검증 미완료", "단어입력에 오류가 있습니다."));
    const actualWords = logicWords.filter(w => w.trim());
    if (!actualWords.length) return Swal.fire(s.swalError("필수 입력", "논리명을 입력하세요."));
    if (!form.infoType) return Swal.fire(s.swalError("필수 선택", "인포타입을 선택하세요."));

    Swal.fire(s.swalLoading("저장 중..."));
    
    try {
      const response = await axios.post(`http://localhost:8000/save_terminology`, {
        logicWords: actualWords, 
        physicNm: form.physicNm, 
        infoType: form.infoType, 
        definition: form.definition
      });

      // 백엔드에서 보낸 type이 UPDATE면 "업데이트 완료", 아니면 "저장 완료"
      const resData = response.data;
      const alertTitle = resData.type === 'UPDATE' ? "업데이트 완료" : "저장 완료";

      await Swal.fire(s.swalSuccess(alertTitle, resData.message));

      handleClear();
      if (setRefreshLog) setRefreshLog(prev => prev + 1);
    } catch (err) { 
      const errMsg = err.response?.data?.detail || "데이터 저장 중 오류가 발생했습니다.";
      Swal.fire(s.swalError("저장 실패", errMsg)); 
    }
  };

  // --- [수정] 알림 적용된 삭제 로직 ---
  const handleDelete = async () => {
    const result = await Swal.fire(s.swalDeleteConfirm("삭제 확인", "해당 용어를 삭제하시겠습니까?"));
    if (result.isConfirmed) {
      Swal.fire(s.swalLoading("삭제 중..."));
      try {
        await axios.delete(`http://localhost:8000/delete_terminology/${form.physicNm}`);
        await Swal.fire(s.swalSuccess("삭제 완료", "정상적으로 삭제되었습니다."));
        handleClear();
        setRefreshLog(prev => prev + 1);
      } catch (err) { Swal.fire(s.swalError("삭제 실패", "삭제 중 오류가 발생했습니다.")); }
    }
  };

  useEffect(() => {
    if (dropdownRef.current && suggestions.list.length > 0) {
      const activeItem = dropdownRef.current.childNodes[suggestions.cursor];
      if (activeItem) activeItem.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [suggestions.cursor]);

  return (
    <div style={s.containerStyle}>
      <div style={s.titleContainerStyle}>
        <h1 style={s.mainTitleStyle}>용어 등록</h1>
        <span style={s.subTitleStyle}>- 단어의 조합으로 형성된 문구 (단, 어미가 도메인으로 종결되어야 한다)</span>
      </div>

      <div style={{ ...s.sectionStyle, maxWidth: '1000px'}}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <h3 style={s.titleStyle}>[ 용어 등록 ]</h3>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button style={s.blueButtonStyle} onClick={handleSave}>저장</button>
            <button 
              style={{ 
                ...s.blueButtonStyle, 
                backgroundColor: isExisting ? '#ff4d4f' : '#e0e0e0', 
                color: isExisting ? 'white' : '#666',
                cursor: isExisting ? 'pointer' : 'default' 
              }} 
              onClick={() => isExisting && handleDelete()} // 🚀 삭제 전용 함수 호출
            >삭제</button>
            <button style={s.clearButtonStyle} onClick={handleClear}>초기화</button>
          </div>
        </div>

        <table style={{ ...s.tableStyle, borderCollapse: 'collapse', border: '1px solid #ddd', tableLayout: 'fixed' }}>
          <tbody>
            <tr style={{ height: '65px' }}>
              <th style={{ ...s.thStyle, width: '150px', backgroundColor: '#f8f9fa' }}>용어논리명</th>
              <td colSpan="5" style={{ ...s.tdStyle, padding: '10px', overflow: 'visible' }}>
                <div style={{ display: 'flex', gap: '15px', justifyContent: 'flex-start', maxWidth: '800px' }}>
                  {logicWords.map((word, idx) => (
                    <div key={idx} style={{ width: '120px', position: 'relative' }}>
                      <input 
                        ref={el => inputRefs.current[idx] = el}
                        style={{ 
                          ...commonInputStyle, textAlign: 'center', padding: '8px 0', border: '1px solid',
                          borderColor: word && !isVerified[idx] ? '#ff4d4f' : '#ddd',
                          boxShadow: word && !isVerified[idx] ? '0 0 0 1px #ff4d4f' : 'none',
                          backgroundColor: isVerified[idx] ? '#f0faff' : '#fff'
                        }} 
                        value={word} placeholder={(idx + 1).toString()}
                        onChange={(e) => handleWordInputChange(idx, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(e, idx)}
                        onFocus={(e) => { e.target.placeholder = ""; if (word.trim() && !isVerified[idx]) handleWordInputChange(idx, word); }} 
                        onBlur={(e) => { e.target.placeholder = (idx + 1).toString(); setTimeout(() => setSuggestions({ idx: null, list: [], cursor: 0 }), 150); }}
                      />
                      {suggestions.idx === idx && suggestions.list.length > 0 && (
                        <div ref={dropdownRef} style={{ position: 'absolute', top: '105%', left: 0, minWidth: '180px', backgroundColor: '#fff', border: '1px solid #4a90e2', zIndex: 9999, boxShadow: '0 8px 16px rgba(0,0,0,0.2)', maxHeight: '200px', overflowY: 'auto' }}>
                          {suggestions.list.map((item, i) => (
                            <div key={i} style={{ padding: '10px 12px', cursor: 'pointer', borderBottom: '1px solid #eee', fontSize: '13px', backgroundColor: i === suggestions.cursor ? '#eef6ff' : '#fff' }} onMouseDown={(e) => { e.preventDefault(); selectWord(idx, item); }} onMouseEnter={() => setSuggestions(prev => ({ ...prev, cursor: i }))}>
                              <b style={{ color: i === suggestions.cursor ? '#0056b3' : '#333' }}>{item.VOCABULARY_STANDARD_KNM}</b> 
                              <span style={{ color: '#666', fontSize: '11px', float: 'right' }}>[{item.VOCABULARY_ABBREVIATION_ENM}]</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </td>
            </tr>
            <tr style={{ height: '55px' }}>
              <th style={{ ...s.thStyle, backgroundColor: '#f8f9fa' }}>용어물리명</th>
              <td colSpan="5" style={{ ...s.tdStyle, padding: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', width: '100%', position: 'relative' }}>
                  <input style={{ ...commonInputStyle, backgroundColor: isExisting ? '#fff3cd' : '#f2f4f6', fontWeight: '800', color: isExisting ? '#dc3545' : '#0056b3', border: '1px solid', borderColor: isExisting ? '#dc3545' : '#ddd', boxShadow: isExisting ? '0 0 0 1px #dc3545' : 'none' }} value={form.physicNm} readOnly />
                  {isExisting && <span style={{ position: 'absolute', left: '102%', color: '#dc3545', fontSize: '11px', fontWeight: 'bold', whiteSpace: 'nowrap' }}>※ 기등록 용어</span>}
                </div>
              </td>
            </tr>
            <tr style={{ height: '55px' }}>
              <th style={{ ...s.thStyle, backgroundColor: '#f8f9fa' }}>도메인그룹</th>
              <td style={{ ...s.tdStyle, width: '25%' }}>
                <select style={commonInputStyle} value={form.domainGroup} onChange={(e) => { setForm({ ...form, domainGroup: e.target.value, domain: '', infoType: '' }); updateCascadingSelectors(e.target.value); }}>
                  <option value="">선택</option>
                  {[...new Set(allDomains.map(d => d.DOMAIN_GROUP_NM))].map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </td>
              <th style={{ ...s.thStyle, width: '100px', backgroundColor: '#f8f9fa' }}>도메인명</th>
              <td style={{ ...s.tdStyle, width: '25%' }}>
                <select style={commonInputStyle} value={form.domain} disabled={!form.domainGroup} onChange={(e) => { setForm({ ...form, domain: e.target.value, infoType: '' }); updateCascadingSelectors(form.domainGroup, e.target.value); setTimeout(() => infoTypeRef.current?.focus(), 100); }}>
                  <option value="">선택</option>
                  {filteredDomains.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </td>
              <th style={{ ...s.thStyle, width: '100px', backgroundColor: '#f8f9fa' }}>인포타입</th>
              <td style={s.tdStyle}>
                <select ref={infoTypeRef} style={commonInputStyle} value={form.infoType} disabled={!form.domain} onChange={(e) => setForm({ ...form, infoType: e.target.value })}>
                  <option value="">선택</option>
                  {filteredInfoTypes.map(i => <option key={i} value={i}>{i}</option>)}
                </select>
              </td>
            </tr>
            <tr>
              <th style={{ ...s.thStyle, backgroundColor: '#f8f9fa' }}>용어정의</th>
              <td colSpan="5" style={{ ...s.tdStyle, padding: '8px' }}>
                <textarea 
                  style={{ 
                    ...commonInputStyle, 
                    height: '60px', 
                    resize: 'none', 
                    padding: '7px 10px 7px 10px', 
                    border: '1px solid #ddd',
                    fontFamily: 'sans-serif',
                    fontSize: '14px',
                    color: '#333'
                  }} 
                  value={form.definition} 
                  onChange={(e) => setForm({ ...form, definition: e.target.value })} 
                  placeholder="정의를 입력하세요." 
                  onFocus={(e) => e.target.placeholder = ""} 
                  onBlur={(e) => e.target.placeholder = "정의를 입력하세요."} 
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default TerminologyAdd;