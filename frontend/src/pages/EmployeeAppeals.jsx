import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import './employeeDashboard.css'

const initialAppeals = [{ id: 'A001', workId: '102', task: 'Database Update', managerScore: '6', requestedScore: '8', reason: 'The database work was completed according to the requirements.', status: 'Pending', comment: '-', date: '-' }]

function EmployeeAppeals() {
    const location = useLocation()
    const selectedWork = location.state?.work
    const [appeals, setAppeals] = useState(initialAppeals)
    const [showForm, setShowForm] = useState(Boolean(selectedWork))
    const [work, setWork] = useState(selectedWork || null)
    const [requestedScore, setRequestedScore] = useState('')
    const [reason, setReason] = useState('')

    function openAppealForm() {
        setWork({ id: '102', task: 'Database Update', score: '6' })
        setShowForm(true)
    }

    function submitAppeal(event) {
        event.preventDefault()
        setAppeals([...appeals, { id: `A00${appeals.length + 1}`, workId: work.id, task: work.task, managerScore: work.score, requestedScore, reason, status: 'Pending', comment: '-', date: '-' }])
        setRequestedScore('')
        setReason('')
        setShowForm(false)
    }

    return (
        <main className="employee-main">
            <div className="page-heading section-heading"><div><h1>My Appeals</h1><p>Review your appeals and request a higher score.</p></div><button className="view-button" onClick={openAppealForm}>Appeal Points</button></div>
            {showForm && work ? <form className="appeal-form" onSubmit={submitAppeal}>
                <h2>Appeal Points</h2><label>Work ID</label><input value={work.id} readOnly /><label>Task</label><input value={work.task} readOnly /><label>Current Manager Score</label><input value={`${work.score}/10`} readOnly />
                <label htmlFor="requested-score">Requested Score</label><input id="requested-score" type="number" min="0" max="10" value={requestedScore} onChange={(event) => setRequestedScore(event.target.value)} required />
                <label htmlFor="appeal-reason">Reason</label><textarea id="appeal-reason" value={reason} onChange={(event) => setReason(event.target.value)} required />
                <div className="form-actions"><button className="view-button" type="submit">Submit Appeal</button><button className="cancel-button" type="button" onClick={() => setShowForm(false)}>Cancel</button></div>
            </form> : <div className="work-section table-container"><table><thead><tr><th>Appeal ID</th><th>Work ID</th><th>Task</th><th>Manager Score</th><th>Employee's Requested Score</th><th>Reason</th><th>Status</th><th>Senior Comment</th><th>Decision Date</th></tr></thead><tbody>{appeals.map((appeal) => <tr key={appeal.id}><td>{appeal.id}</td><td>{appeal.workId}</td><td>{appeal.task}</td><td>{appeal.managerScore}/10</td><td>{appeal.requestedScore}/10</td><td>{appeal.reason}</td><td><span className="status pending">{appeal.status}</span></td><td>{appeal.comment}</td><td>{appeal.date}</td></tr>)}</tbody></table></div>}
        </main>
    )
}

export default EmployeeAppeals