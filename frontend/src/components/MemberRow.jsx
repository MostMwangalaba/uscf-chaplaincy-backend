import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { FaPlus } from 'react-icons/fa';

const MemberRow = ({ member, onAddFund, memberTarget }) => {
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const fetchTotal = async () => {
      try {
        const res = await api.get('/contributions');
        const memberContribs = res.data.filter(c => c.member_id === member.id);
        const sum = memberContribs.reduce((acc, c) => acc + Number(c.amount), 0);
        setTotal(sum);
      } catch (err) {
        setTotal(0);
      }
    };
    fetchTotal();
  }, [member.id]);

  const percentage = memberTarget > 0 ? (total / memberTarget) * 100 : 0;

  return (
    <tr className="border-t border-gray-100">
      <td className="py-3 px-4 text-sm">{member.name}</td>
      <td className="py-3 px-4 text-sm font-mono">{member.member_id}</td>
      <td className="py-3 px-4 text-sm">{member.mobile}</td>
      <td className="py-3 px-4 text-sm font-semibold text-indigo-600">
        TZS {Number(total).toLocaleString()}
      </td>
      {memberTarget > 0 && (
        <td className="py-3 px-4 text-sm">
          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
            {Math.min(percentage, 100).toFixed(1)}%
          </span>
          <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
            <div 
              className="bg-blue-600 h-1.5 rounded-full" 
              style={{ width: `${Math.min(percentage, 100)}%` }}
            />
          </div>
        </td>
      )}
      <td className="py-3 px-4 text-sm">
        <button
          onClick={() => onAddFund(member)}
          className="bg-indigo-600 text-white px-3 py-1 rounded-lg hover:bg-indigo-700 flex items-center gap-1"
        >
          <FaPlus size={12} /> Add Fund
        </button>
      </td>
    </tr>
  );
};

export default MemberRow;
