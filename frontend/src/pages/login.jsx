import './Login.css'

function Login() {
    return (
        <div className="Login_Container">
            <h1>Login</h1>

            <label>Email</label>
            <input type="email" />

            <label>Password</label>
            <input type="password" />

            <label>Role</label>
            <select>
                <option value="Employee">Employee</option>
                <option value="Manager">Manager</option>
                <option value="Senior Authority">Senior Authority</option>
            </select>

            <button>Login</button>
        </div>
    )
}

export default Login
