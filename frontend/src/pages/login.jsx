import './login.css'

function Login() {
    return (
        <div className="Login_Page">

            <div className="Login_left">
                <h1>Welcome!</h1>
                <p>Track. Review. Improve.</p>
            </div>

            <div className="Login_right">

                <div className="Login_Box">

                    <h1>Login</h1>

                   <p className="login-subtitle">Welcome back!</p>
                    <input
                        type="text"
                        placeholder="Enter Email"
                        autoComplete="off"
                    />

                    
                    <input
                        type="password"
                        placeholder="Enter password"
                        autoComplete="new-password"
                    />

                    <label>Role</label>
                    <select>
                        <option value="Employee">Employee</option>
                        <option value="Manager">Manager</option>
                        <option value="Senior Authority">
                            Senior Authority
                        </option>
                    </select>

                    <button>Login</button>

                    <div className="Forgot_Password">
                        <a href="#">Forgot Password?</a>
                    </div>

                </div>

            </div>

        </div>
    )
}

export default Login