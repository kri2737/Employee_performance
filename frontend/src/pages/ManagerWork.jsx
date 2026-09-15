import { useState } from 'react'
import './employeeDashboard.css'

const initialTeamWork = [
    { id: '201', employee: 'Ananya Agarwal', task: 'Project Documentation', description: 'Prepare project documentation.', date: '14 Sep 2026', status: 'Completed', managerScore: '', managerComment: '', managerStatus: 'Pending' },
    { id: '202', employee: 'Rahul Sharma', task: 'Application Testing', description: 'Test the employee dashboard.', date: '13 Sep 2026', status: 'Completed', managerScore: '8', managerComment: 'Good testing work.', managerStatus: 'Approved' },
    { id: '203', employee: 'Priya Singh', task: 'Database Update', description: 'Update performance records.', date: '12 Sep 2026', status: 'Pending', managerScore: '', managerComment: '', managerStatus: 'Pending' },
]

function ManagerWork() {
    const [teamWork, setTeamWork] = useState(initialTeamWork)

    function updateWork(id, field, value) {
        setTeamWork(teamWork.map((work) => work.id === id ? { ...work, [field]: value } : work))
    }

    function decideWork(id, managerStatus) {
        setTeamWork(teamWork.map((work) => work.id === id ? { ...work, managerStatus } : work))
    }

    function canApprove(work) {
        return work.managerScore !== '' && Number(work.managerScore) >= 0 && Number(work.managerScore) <= 10
    }

    return (
        <main className="employee-main">
            <div className="page-heading"><h1>Team Work</h1><p>Review and score work submitted by your team.</p></div>
            <div className="work-section table-container">
                <table>
                    <thead><tr><th>Work ID</th><th>Employee</th><th>Task</th><th>Description</th><th>Work Date</th><th>Status</th><th>Manager Score</th><th>Manager Comment</th><th>Action</th></tr></thead>
                    <tbody>{teamWork.map((work) => (
                        <tr key={work.id}>
                            <td>{work.id}</td><td>{work.employee}</td><td>{work.task}</td><td>{work.description}</td><td>{work.date}</td><td>{work.status}</td>
                            <td>{work.managerStatus === 'Pending' ? <input className="score-input" type="number" min="0" max="10" value={work.managerScore} onChange={(event) => updateWork(work.id, 'managerScore', event.target.value)} /> : `${work.managerScore}/10`}</td>
                            <td>{work.managerStatus === 'Pending' ? <textarea className="comment-input" value={work.managerComment} onChange={(event) => updateWork(work.id, 'managerComment', event.target.value)} placeholder="Comment" /> : work.managerComment}</td>
                            <td>{work.managerStatus === 'Pending' ? <div className="action-buttons"><button disabled={!canApprove(work)} onClick={() => decideWork(work.id, 'Approved')}>Approve</button><button onClick={() => decideWork(work.id, 'Rejected')}>Reject</button></div> : <span className={`status ${work.managerStatus.toLowerCase()}`}>{work.managerStatus}</span>}</td>
                        </tr>
                    ))}</tbody>
                </table>
            </div>
        </main>
    )
}

export default ManagerWork