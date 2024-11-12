
import AddFriend from './addFriend';
import React, {useState, useEffect} from 'react';
import { useUser } from '../UserContext';
export default function Friends() {
    const {state,dispatch} = useUser();

    const [showAddFriend, setShowAddFriend] = useState(false);
    
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/social/get-users');
                const data = await response.json();
                
                const fetchedUsers = Array.isArray(data.users) ? data.users : [];
                
                dispatch({
                    type: 'LOAD_USERS',
                    payload: fetchedUsers 
                  });

                console.log(fetchedUsers)
                console.log(state.users)

            } catch (error) {
                console.error('Error fetching users:', error);
                return [];
            }

            
     };

        fetchUsers();
    }, []);

    return(
        <div>
            <div className="menu-container">
            <button className="btn btn-primary"
                onClick={()=>viewFriends() }
            >
                View

            </button>
            <button className="btn btn-primary"
                onClick={() => setShowAddFriend(true)}
            >
                Add
            </button>
            <button className="btn btn-primary"
                onClick={()=>scheduleMeeting() }
            >
                Schedule Meeting
            </button>

        </div>
        {showAddFriend && <AddFriend />}
        </div>
    )
}