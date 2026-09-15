import { useNavigate } from 'react-router-dom'
import './employeeDashboard.css'

const pendingAppeals = [
    { id: 'A001', workId: '102', employee: 'Ananya Agarwal', reason: 'The database work was completed according to the requirements.', date: '15 Sep 2026', status: 'Pending' },
    { id: 'A002', workId: '203', employee: 'Priya Singh', reason: 'All requested tests were completed.', date: '14 Sep 2026', status: 'Pending' },
]

function SeniorDashboard() {
    const navigate = useNavigate()

    return (
        <main className="employee-main">
            <div className="welcome-section"><h1>Welcome back, Senior Authority!</h1></div>
            <div className="stats-container"><div className="stat-box"><h3>Total Appeals</h3><p>12</p></div><div className="stat-box"><h3>Pending Appeals</h3><p>2</p></div><div className="stat-box"><h3>Approved Appeals</h3><p>7</p></div><div className="stat-box"><h3>Rejected Appeals</h3><p>3</p></div></div>
            <div className="work-section table-container"><div className="section-heading"><h2>Pending Appeals</h2></div><table><thead><tr><th>Appeal ID</th><th>Work ID</th><th>Employee</th><th>Reason</th><th>Appeal Date</th><th>Status</th><th>Action</th></tr></thead><tbody>{pendingAppeals.map((appeal) => <tr key={appeal.id}><td>{appeal.id}</td><td>{appeal.workId}</td><td>{appeal.employee}</td><td>{appeal.reason}</td><td>{appeal.date}</td><td><span className="status pending">{appeal.status}</span></td><td><div className="action-buttons"><button onClick={() => navigate('/senior/appeals')}>View</button><button onClick={() => navigate('/senior/appeals')}>Approve Appeal</button><button onClick={() => navigate('/senior/appeals')}>Reject Appeal</button></div></td></tr>)}</tbody></table></div>
        </main>
    )
}

export default SeniorDashboard