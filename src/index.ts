// const functions = require("firebase-functions");
// const Analytics = require('analytics').default;
// const googleAnalytics = require('@analytics/google-analytics').default;
// const kRcWebhookEventsCollection = "rc-webhook-events";
// const admin = require("firebase-admin");
import {onDocumentCreated} from "firebase-functions/firestore";
import {initializeApp} from "firebase-admin/app";
import {getEventarc} from "firebase-admin/eventarc";

initializeApp();

// // Initialize Analytics with your actual GA4 measurement ID and API secret
// const analytics = Analytics({
//   app: 'Scheduler',
//   plugins: [
//     googleAnalytics({
//       measurementId: 'your-measurement-id',      // Your measurement ID
//       apiSecret: 'your-api-secret', // Your API secret
//       cookieless: true,             // Required for server-side
//       isServerSide: true,          // Explicitly set for server-side
//       //debug: true  // Helpful during development, remove in production
//     })
//   ]
// });

// exports.trackWebhookEvents = functions.firestore
//   .document(`${kRcWebhookEventsCollection}/{id}`)
//   .onCreate(async (snapshot:any, context:any) => {
//     try {
//       const data = snapshot.data();
//       // Check if this is an initial purchase event
//       if (data.type === "INITIAL_PURCHASE") {
//         // Get the user ID from the document path or data
//         const userId = data.user_id || context.params.id;

//         // Generate a consistent client ID for this user
//         const clientId = userId ? `server_${userId}` :
//  `server_anonymous_${context.params.id}`;

//         // Track the event using the analytics package
//         // await analytics.track({
//         //   userId: userId,
//         //   event: 'web_subscription',
//         //   properties: {
//         //     client_id: clientId,
//         //     purchase_type: "initial",
//         //     timestamp: Date.now()
//         //   }
//         // });
//         logEvent(analytics, 'web_subscription', {
//           client_id: clientId,
//           purchase_type: "initial",
//           timestamp: Date.now()
//         });

//         console.log(`Successfully tracked initial
//          purchase for user ${userId}`);
//       }
//     } catch (error) {
//       console.error("Error tracking webhook event:", error);
//     }
//   });

exports.trackWebhookEvents = onDocumentCreated(
  "kRcWebhookEventsCollection/{id}", (event) => {
  // Get an object representing the document
  // e.g. {'name': 'Marie', 'age': 66}
    const snapshot = event.data;
    if (!snapshot) {
      console.log("No data associated with the event");
      return;
    }

    try {
      const data = snapshot.data();
      if (data.type === "INITIAL_PURCHASE") {
      // Get the user ID from the document path or data
        const userId = data.user_id || event.params.id;

        // Generate a consistent client ID for this user
        const clientId = userId ?
          `server_${userId}` : `server_anonymous_${event.params.id}`;

        // Track the event using the analytics package
        // await analytics.track({
        //   userId: userId,
        //   event: 'web_subscription',
        //   properties: {
        //     client_id: clientId,
        //     purchase_type: "initial",
        //     timestamp: Date.now()
        //   }
        // });
        getEventarc().channel().publish({
          type: "web-subscription",
          subject: "New user Subscribed",
          data: {
            client_id: clientId,
            purchase_type: "initial",
            timestamp: Date.now(),
          },
        });
        console.log(`Successfully tracked initial purchase for user ${userId}`);
      }
    } catch (error) {
      console.error("Error tracking webhook event:", error);
    }
  });
