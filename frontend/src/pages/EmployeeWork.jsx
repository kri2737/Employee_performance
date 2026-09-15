import './employeeDashboard.css'

const workItems = [
    { id: '101', task: 'Project Documentation', description: 'Prepare the project setup and usage documentation.', date: '14 Sep 2026', status: 'Completed', managerStatus: 'Approved', creditStatus: 'Credited', comment: 'Good work', action: 'View' },
    { id: '102', task: 'Database Update', description: 'Update the employee performance database records.', date: '13 Sep 2026', status: 'Completed', managerStatus: 'Pending', creditStatus: 'Pending', comment: 'Under review', action: 'View' },
    { id: '103', task: 'Application Testing', description: 'Test the employee dashboard and report issues.', date: '12 Sep 2026', status: 'Pending', managerStatus: 'Pending', creditStatus: 'Not Credited', comment: '-', action: 'View' },
]

function EmployeeWork() {
    return (
        <main className="employee-main">
            <div className="page-heading">
                <h1>My Work</h1>
                <p>Review your submitted work and its current status.</p>
            </div>

            <div className="work-section table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Work ID</th><th>Task</th><th>Description</th><th>Work Date</th>
                            <th>Status</th><th>Manager Status</th><th>Credit Status</th><th>Manager Comment</th><th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {workItems.map((work) => (
                            <tr key={work.id}>
                                <td>{work.id}</td><td>{work.task}</td><td>{work.description}</td><td>{work.date}</td>
                                <td><span className={`status ${work.status.toLowerCase()}`}>{work.status}</span></td>
                                <td>{work.managerStatus}</td><td>{work.creditStatus}</td><td>{work.comment}</td>
                                <td><button className="text-button">{work.action}</button></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </main>
    )
}

export default EmployeeWork