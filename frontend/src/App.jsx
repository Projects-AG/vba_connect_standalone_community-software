// import { useState } from "react";

// import VideoDemo from "./video/pages/VideoDemo";
// import NotificationDemo from "./notification/pages/NotificationDemo";

// export default function App() {

//   const [activeDemo, setActiveDemo] = useState("video");

//   return (
//     <div className="min-h-screen bg-gray-100">

//       <div className="flex justify-center gap-4 py-4 bg-white shadow">

//         <button
//           onClick={() => setActiveDemo("video")}
//           className={`px-6 py-2 rounded-lg font-semibold transition ${activeDemo === "video"
//             ? "bg-blue-600 text-white"
//             : "bg-gray-200 hover:bg-gray-300"
//             }`}
//         >
//           🎥 Video Demo
//         </button>

//         <button
//           onClick={() => setActiveDemo("notification")}
//           className={`px-6 py-2 rounded-lg font-semibold transition ${activeDemo === "notification"
//             ? "bg-green-600 text-white"
//             : "bg-gray-200 hover:bg-gray-300"
//             }`}
//         >
//           🔔 Notification Demo
//         </button>

//       </div>

//       {activeDemo === "video" ? (
//         <VideoDemo />
//       ) : (
//         <NotificationDemo />
//       )}

//     </div>
//   );

// // }
// import { useState, useEffect } from "react";
// import {
//   Routes,
//   Route,
// } from "react-router-dom";
// import JoinMeetingPage from "./meetings/pages/JoinMeetingPage";
// import VideoDemo from "./video/pages/VideoDemo";
// import { useMeetingContext } from "./meetings/context/MeetingContext";
// import NotificationDemo from "./notification/pages/NotificationDemo";
// import { LeadershipDirectory } from "./leadership";
// import { CallRequestDashboard } from "./callRequests";

// export default function App() {

//   const { meeting } = useMeetingContext();
//   const [activeDemo, setActiveDemo] = useState("leadership");
//   useEffect(() => {

//     if (meeting) {

//       setActiveDemo("video");

//     }

//   }, [meeting]);

//   return (
//     <div className="min-h-screen bg-gray-100">

//       <div className="flex flex-wrap justify-center gap-4 py-4 bg-white shadow">

//         <button
//           onClick={() => setActiveDemo("video")}
//           className={`px-6 py-2 rounded-lg font-semibold transition ${activeDemo === "video"
//             ? "bg-blue-600 text-white"
//             : "bg-gray-200 hover:bg-gray-300"
//             }`}
//         >
//           🎥 Video Demo
//         </button>

//         <button
//           onClick={() => setActiveDemo("notification")}
//           className={`px-6 py-2 rounded-lg font-semibold transition ${activeDemo === "notification"
//             ? "bg-green-600 text-white"
//             : "bg-gray-200 hover:bg-gray-300"
//             }`}
//         >
//           🔔 Notification Demo
//         </button>

//         <button
//           onClick={() => setActiveDemo("leadership")}
//           className={`px-6 py-2 rounded-lg font-semibold transition ${activeDemo === "leadership"
//             ? "bg-purple-600 text-white"
//             : "bg-gray-200 hover:bg-gray-300"
//             }`}
//         >
//           👥 Leadership Directory
//         </button>

//         <button
//           onClick={() => setActiveDemo("call")}
//           className={`px-6 py-2 rounded-lg font-semibold transition ${activeDemo === "call"
//             ? "bg-red-600 text-white"
//             : "bg-gray-200 hover:bg-gray-300"
//             }`}
//         >
//           📞 Call Requests
//         </button>

//       </div>

//       {activeDemo === "video" && <VideoDemo />}

//       {activeDemo === "notification" && <NotificationDemo />}

//       {activeDemo === "leadership" && <LeadershipDirectory />}

//       {activeDemo === "call" && <CallRequestDashboard />}

//     </div>
//   );

// }


import { useState, useEffect } from "react";
import {
  Routes,
  Route,
} from "react-router-dom";

import VideoDemo from "./video/pages/VideoDemo";
import NotificationDemo from "./notification/pages/NotificationDemo";
import JoinMeetingPage from "./meetings/pages/JoinMeetingPage";
import { LeadershipDirectory } from "./leadership";
import { CallRequestDashboard } from "./callRequests";
import { useMeetingContext } from "./meetings/context/MeetingContext";

export default function App() {

  const { meeting } = useMeetingContext();

  const [activeDemo, setActiveDemo] = useState("leadership");

  useEffect(() => {

    if (meeting) {

      setActiveDemo("video");

    }

  }, [meeting]);

  return (

    <Routes>

      {/* Home */}

      <Route
        path="/"
        element={

          <div className="min-h-screen bg-gray-100">

            <div className="flex flex-wrap justify-center gap-4 py-4 bg-white shadow">

              <button
                onClick={() => setActiveDemo("video")}
                className={`px-6 py-2 rounded-lg font-semibold transition ${activeDemo === "video"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 hover:bg-gray-300"
                  }`}
              >
                🎥 Video Demo
              </button>

              <button
                onClick={() => setActiveDemo("notification")}
                className={`px-6 py-2 rounded-lg font-semibold transition ${activeDemo === "notification"
                  ? "bg-green-600 text-white"
                  : "bg-gray-200 hover:bg-gray-300"
                  }`}
              >
                🔔 Notification Demo
              </button>

              <button
                onClick={() => setActiveDemo("leadership")}
                className={`px-6 py-2 rounded-lg font-semibold transition ${activeDemo === "leadership"
                  ? "bg-purple-600 text-white"
                  : "bg-gray-200 hover:bg-gray-300"
                  }`}
              >
                👥 Leadership Directory
              </button>

              <button
                onClick={() => setActiveDemo("call")}
                className={`px-6 py-2 rounded-lg font-semibold transition ${activeDemo === "call"
                  ? "bg-red-600 text-white"
                  : "bg-gray-200 hover:bg-gray-300"
                  }`}
              >
                📞 Call Requests
              </button>

            </div>

            {activeDemo === "video" && <VideoDemo />}

            {activeDemo === "notification" && <NotificationDemo />}

            {activeDemo === "leadership" && <LeadershipDirectory />}

            {activeDemo === "call" && <CallRequestDashboard />}

          </div>

        }
      />

      {/* Join Meeting */}

      <Route
        path="/join/:meetingId"
        element={<JoinMeetingPage />}
      />

    </Routes>

  );

}