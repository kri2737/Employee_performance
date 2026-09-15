import './employeeDashboard.css'

const pendingReviews = [
    { id: '201', employee: 'Ananya Agarwal', task: 'Project Documentation', date: '14 Sep 2026', status: 'Pending' },
    { id: '202', employee: 'Rahul Sharma', task: 'Application Testing', date: '13 Sep 2026', status: 'Pending' },
]

function ReviewActions() {
    return <div className="action-buttons"><button>View</button><button>Approve</button><button>Reject</button></div>
}

function ManagerDashboard() {
    return (
        <main className="employee-main">
            <div className="welcome-section">
                <h1>Welcome back, Manager!</h1>
                <p>Here's an overview of your team's work.</p>
            </div>

            <div className="stats-container manager-stats">
                <div className="stat-box"><h3>Total Team Members</h3><p>8</p></div>
                <div className="stat-box"><h3>Total Tasks</h3><p>32</p></div>
                <div className="stat-box"><h3>Pending Reviews</h3><p>5</p></div>
                <div className="stat-box"><h3>Approved Tasks</h3><p>22</p></div>
                <div className="stat-box"><h3>Rejected Tasks</h3><p>5</p></div>
            </div>

            <div className="work-section table-container">
                <div className="section-heading"><h2>Pending Reviews</h2></div>
                <table>
                    <thead><tr><th>Work ID</th><th>Employee</th><th>Task</th><th>Work Date</th><th>Status</th><th>Action</th></tr></thead>
                    <tbody>{pendingReviews.map((work) => (
                        <tr key={work.id}>
                            <td>{work.id}</td><td>{work.employee}</td><td>{work.task}</td><td>{work.date}</td>
                            <td><span className="status pending">{work.status}</span></td><td><ReviewActions /></td>
                        </tr>
                    ))}</tbody>
                </table>
            </div>
        </main>
    )
}

export default ManagerDashboard