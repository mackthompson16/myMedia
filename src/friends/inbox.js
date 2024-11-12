import React from 'react';
import { useUser } from '../UserContext'; 

export default function Inbox() {
    const { state, dispatch } = useUser(); 
  
   
    
    const handleFriendRequest = async (message) => {
            try {
              const response = await fetch(`http://localhost:5000/api/social/accept-friend-request`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  sender_id: message.sender_id,
                  recipient_id: message.recipient_id,
                  recipient_username: state.username
              })
              });
        
              const data = await response.json();
              if (data.success) {
               
                dispatch({
                  type: 'ADD_FRIEND',
                  payload: friendId,
                });
              } else {
                console.error('Failed to accept friend request:', data.message);
              }
            } catch (error) {
              console.error('Error accepting friend request:', error);
            }
       
      };
    
      const handleMeetingRequest = async (messageId) => {
        try {
          const response = await fetch(`http://localhost:5000/api/social/accept-meeting-request`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message_id: messageId, user_id: state.id }),
          });
    
          const data = await response.json();
    
          if (data.success) {
            console.log(`Meeting request scheduled for message ${messageId}`);
            
            // Dispatch ADD_COMMITMENT action with the commitment data from the backend response
            dispatch({
              type: 'ADD_COMMITMENT',
              payload: data.commitment, // Assume backend returns the commitment object
            });
          } else {
            console.error('Failed to schedule meeting request:', data.message);
          }
        } catch (error) {
          console.error('Error scheduling meeting request:', error);
        }
      };
  
    return (
      <div className="Messages-Menu">
        <h2>Inbox Messages</h2>
        {state.inbox && state.inbox.length > 0 ? (
           <ul>
           {state.inbox.map((message, index) => (
            
             <li key={index} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
               <div>
                 <p><strong>{console.log(message)}{message.sender_username}</strong></p> {/* Display the username as the header */}
                 <p>
                    {message.type === 'friend_request' && message.status !== 'accepted' ? (
                      <button onClick={() => handleFriendRequest(message)}>Accept Friend Request</button>
                    ) : message.type === 'friend_request' && message.status === 'accepted' ? (
                      `Friend request accepted`
                    ) : null}

                    {message.type === 'meeting_request' && message.status !== 'accepted' ? (
                      <button onClick={() => handleMeetingRequest(message.message_id)}>Schedule Meeting</button>
                    ) : message.type === 'meeting_request' && message.status === 'accepted' ? (
                      `Meeting request accepted`
                    ) : null}
                  </p>
               </div>
             </li>
           ))}
         </ul>
        ) : (
          <p>No messages available.</p>
        )}
      </div>
    );
  }
  