Hi! Welcome to this section of Aura.

This text file is to explain the logic behind user login and sign up.

The way it works is by assigning a unique userID to the user when they sign up (create an account) with us.
This userID is then stored on the database and is fetched everytime the user successfuly logs in.
Now the way the app checks if the user has logged in in the past is by checking if a .txt file containing their
unique userID is present in a specific path (always the same) within Aura's root directory on the user device's disk. 
(This .txt file is created when the user first logs in or first signs up on the device). 
The file is then deleted from the device when user logs out. This helps us comply with the cia triad and the GDPR regulations,
protecting customer data. 
