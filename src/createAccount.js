import React, {useState} from 'react';
import { useUser } from './UserContext';
import Login from './login';
export default function CreateAccount() {
  
  const { dispatch } = useUser();
  const [accInfo, setAccInfo] = useState({
    username: '',
    password: '',
    email: ''
  });
  const [login, setLogin] = useState(false);


  const handleChange = (event) => {
    const { name, value } = event.target;
    setAccInfo({
      ...accInfo,
      [name]: value
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    // Send a POST request to the backend to create the account
    const response = await fetch('http://localhost:5000/api/auth/create-account', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(accInfo),  // Send the user input to the backend
    });

    const data = await response.json();  // Get the response from the backend
    if (data.success) {
      // Account was created successfully
      console.log('Account created successfully:', data.id);

      // Dispatch action to update context with accInfo (already available in the frontend)
      dispatch({
        type: 'REPLACE_CONTEXT',
        payload: { id: data.id, ...accInfo }  // Use accInfo to set data in the context
      });
    } else {
      alert('Account creation failed');
    }

  

  };



  return (
    

    <div className="container">

    {login && (<Login/> )}
    {!login && (
    <form onSubmit={handleSubmit}>
        <div className="form">
          
            <input
                type="text"
                id="username"
                name="username"
                value={accInfo.username}
                onChange={handleChange}
                placeholder="Username"
                className="form-control"
            />
        

        
          
            <input
                type="password"
                id="password"
                name="password"
                value={accInfo.password}
                onChange={handleChange}
                placeholder="Password"
                className="form-control"
            />
        
        
            <input
                type="email"
                id="email"
                name="email"
                value={accInfo.email}
                onChange={handleChange}
                placeholder="Email"
                className="form-control"
            />
       
        <div className="button-container">
          <button type="submit" className="btn btn-primary">Submit</button>
          <button onClick={() => setLogin(true)} className="btn btn-secondary">Cancel</button>
          </div>
        </div>
    </form>
    )}
</div>

);

}

