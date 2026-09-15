import { useNavigate } from 'react-router-dom'
import './employeeDashboard.css'

const recentWork = [
    { id: '101', task: 'Project Documentation', date: '14 Sep 2026', status: 'Completed', score: '8', action: 'View' },
    { id: '102', task: 'Database Update', date: '13 Sep 2026', status: 'Completed', score: '6', action: 'Appeal' },
    { id: '103', task: 'Application Testing', date: '12 Sep 2026', status: 'Pending', score: '', action: 'View' },
]

function EmployeeDashboard() {
    const navigate = useNavigate()

    function openAppeal(work) {
        navigate('/employee/appeals', { state: { work } })
    }

    return (
        <main className="employee-main">
            <div className="welcome-section"><h1>Welcome back, Ananya!</h1><p>Here's an overview of your work and performance.</p></div>
            <div className="stats-container">
                <div className="stat-box"><h3>Total Work</h3><p>12</p></div><div className="stat-box"><h3>Completed</h3><p>8</p></div><div className="stat-box"><h3>Total Points</h3><p>46</p></div><div className="stat-box"><h3>Pending Reviews</h3><p>2</p></div>
            </div>
            <div className="work-section">
                <div className="section-heading"><h2>My Recent Work</h2><button className="view-button">View All</button></div>
                <table>
                    <thead><tr><th>Work ID</th><th>Task</th><th>Work Date</th><th>Status</th><th>Manager Score</th><th>Action</th></tr></thead>
                    <tbody>{recentWork.map((work) => <tr key={work.id}><td>{work.id}</td><td>{work.task}</td><td>{work.date}</td><td><span className={`status ${work.status.toLowerCase()}`}>{work.status}</span></td><td>{work.score ? `${work.score}/10` : '-'}</td><td>{work.score ? <button className="text-button" onClick={() => work.action === 'Appeal' && openAppeal(work)}>{work.action}</button> : '-'}</td></tr>)}</tbody>
                </table>
            </div>
        </main>
    )
}

export default EmployeeDashboard