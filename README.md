# 📌 Real-Time Collaborative To-Do Board


Hello, my name is **Sonu** and I am a student at **Baba Farid College, Bathinda, Punjab**.  
I am currently pursuing **BCA**.  
The below project is the **Full Stack Collaborative Real-Time To-Do Board** I was assigned to build.

---

## 🎥 Live voiceover Video previe
- **Google Drive:** 
### 🔗 Video Link
👉 [Video Google Drive](https://dotasker.netlify.addurlshere)


##  👩‍💻 Tech Used
- **Frontend:** React with Vite and Socket.io
- **Backend:** Express , Mongo and Socket.io

## 🚀 Frontend Logic, URLs, and Setup
- **Frontend Deployment:** Hosted on **Netlify**  
- **Responsiveness:** Fully responsive on all screen sizes  
- **Theme:** Dark Mode  
- **Design:** Fully custom, without any UI library  

### 🔗 Live URL (Frontend)  
👉 [Deployed Frontend Link](https://dotasker.netlify.app)

---

Setup Locally => 

STEP 1:
First clone the repo inside your local machine.

```bash
git clone https://github.com/Sonudhukia143/MERN-TODO-APP
```

^ The above code will clone a repo with two folders server and client inside a MERN-TODO-APP directory now to run client you will not need any environment variables.

STEP 2:
Now in git bash go to MERN-TODO-APP folder and then to client folder install dependencies and start server.

```bash
cd MERN-TODO-APP/client
npm i
npm run dev 
# This starts a local server on port 5173 and now visit localhost:5173 in your browser.
```

Note : The frontend will work fine even if you donot use or run backend as client side is connected to a deployed backend on render which allows cors request from 5173 ports as it has been whitelisted there.


## 🧠 Backend Logic, URLs, and Setup

- **Backend Deployment:** Hosted on **Render**  
- **Features:**  
  - Full CRUD functionality for tasks  
  - User authentication (register/login)  
  - Real-time updates via Socket.IO  
  - Smart Assign route  
  - Conflict resolution with merge/overwrite option

### 🔗 Live URL (Backend)  
👉 [Deployed Backend API](https://to-do-task-manager.onrender.com/api/test)

### Live backend url redirects to /api/test route which will tell you if backend is working fine rest of the routes can only be accessed thorugh postman for testing as all of them are either post , put , patch routes.

---

STEP 1:
First clone the repo inside your local machine.

```bash
git clone https://github.com/Sonudhukia143/MERN-TODO-APP
```

^ The above code will clone a repo with two folders server and client inside a MERN-TODO-APP directory now to run backend you will need environment variables.

```env
MONGODB_URI=// YOUR MONGO DB URL , YOU CAN GET IT FROM MONGODB CLOUD ATLAS AFTER CREATING A CLUSTER

JWT_SECRET=// This is just a random token to verify authenticity of a logged in user make sure to add it 
```

STEP 2:
Now in git bash go to MERN-TODO-APP folder and then to server folder install dependencies and start server.

```bash
cd MERN-TODO-APP/server
npm i
npm run dev
#  This starts a local server on port 3000 and now visit localhost:3000/api/test in your browser to check if backend is working properly also see realted logs for mongoDB connection inside the git bash folder.
```

Note : The backend logic will work fine with your localmachine but after deploying it you will explicitly need to tell your code about your deployed frontend and add it as a whitelisted address to make sure no cors error occur.


📧 **Contact:**  
For queries or issues, you can reach me at [jagdishdhukia770@gmail.com](mailto:jagdishdhukia770@gmail.com)
