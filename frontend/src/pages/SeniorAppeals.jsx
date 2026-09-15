import { useState } from 'react'
import './employeeDashboard.css'

const initialAppeals = [
    { id: 'A001', workId: '102', employee: 'Ananya Agarwal', task: 'Database Update', managerScore: '6', requestedScore: '9', reason: 'The database work was completed according to the requirements.', managerComment: 'Needs more detail.', status: 'Pending', seniorComment: '', finalScore: '' },
    { id: 'A002', workId: '203', employee: 'Priya Singh', task: 'Application Testing', managerScore: '7', requestedScore: '9', reason: 'All requested tests were completed.', managerComment: 'Some tests were missing.', status: 'Pending', seniorComment: '', finalScore: '' },
]

function SeniorAppeals() {
    const [appeals, setAppeals] = useState(initialAppeals)
    const [activeAppeal, setActiveAppeal] = useState(null)
    const [finalScore, setFinalScore] = useState('')
    const [seniorComment, setSeniorComment] = useState('')

    function openDecision(appeal) {
        setActiveAppeal(appeal)
        setFinalScore(appeal.managerScore)
        setSeniorComment('')
    }

    function decideAppeal(status) {
        setAppeals(appeals.map((appeal) => appeal.id === activeAppeal.id ? { ...appeal, status, finalScore: status === 'Approved' ? finalScore : appeal.managerScore, seniorComment } : appeal))
        setActiveAppeal(null)
    }

    return (
        <main className="employee-main">
            <div className="page-heading"><h1>Appeals</h1><p>Review employee score appeals.</p></div>
            {activeAppeal ? <form className="appeal-form" onSubmit={(event) => event.preventDefault()}>
                <h2>Review Appeal {activeAppeal.id}</h2>
                <p>Current Manager Score: {activeAppeal.managerScore}/10</p><p>Employee Requested: {activeAppeal.requestedScore}/10</p>
                <label htmlFor="final-score">Final Score</label><input id="final-score" type="number" min="0" max="10" value={finalScore} onChange={(event) => setFinalScore(event.target.value)} />
                <label htmlFor="senior-comment">Senior Comment</label><textarea id="senior-comment" value={seniorComment} onChange={(event) => setSeniorComment(event.target.value)} />
                <div className="form-actions"><button className="view-button" type="button" onClick={() => decideAppeal('Approved')}>Approve Appeal</button><button className="cancel-button" type="button" onClick={() => decideAppeal('Rejected')}>Reject Appeal</button><button className="cancel-button" type="button" onClick={() => setActiveAppeal(null)}>Cancel</button></div>
            </form> : <div className="work-section table-container">
                <table><thead><tr><th>Appeal ID</th><th>Employee</th><th>Work ID</th><th>Task</th><th>Manager Score</th><th>Employee Requested Score</th><th>Employee Reason</th><th>Manager Comment</th><th>Status</th><th>Action</th></tr></thead>
                    <tbody>{appeals.map((appeal) => <tr key={appeal.id}><td>{appeal.id}</td><td>{appeal.employee}</td><td>{appeal.workId}</td><td>{appeal.task}</td><td>{appeal.managerScore}/10</td><td>{appeal.requestedScore}/10</td><td>{appeal.reason}</td><td>{appeal.managerComment}</td><td>{appeal.status}</td><td><div className="action-buttons"><button onClick={() => openDecision(appeal)}>View</button>{appeal.status === 'Pending' && <><button onClick={() => openDecision(appeal)}>Approve Appeal</button><button onClick={() => openDecision(appeal)}>Reject Appeal</button></>}</div></td></tr>)}</tbody>
                </table>
            </div>}
        </main>
    )
}

export default SeniorAppeals