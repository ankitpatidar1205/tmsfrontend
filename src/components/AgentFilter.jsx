import React from 'react'
import { useData } from '../context/DataContext'
import { FiUser } from 'react-icons/fi'

const AgentFilter = ({ selectedAgent, onAgentChange, showAll = true }) => {
  const { agents } = useData()

  return (
    <div className="flex items-center gap-2">
      <FiUser className="text-text-secondary" size={18} />
      <select
        value={selectedAgent || ''}
        onChange={(e) => onAgentChange(e.target.value || null)}
        className="input-field-3d min-w-[200px]"
      >
        {showAll && <option value="">All Agents</option>}
        {agents.map((agent) => (
          <option key={agent.id} value={agent.id}>
            {agent.name}
          </option>
        ))}
      </select>
    </div>
  )
}

export default AgentFilter

