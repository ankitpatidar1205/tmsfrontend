Here’s an updated **Task Master** based on your request for a **Login Page**, role-based views, unique dashboards for different user roles (Agent, Finance, Admin), and other specifications, using **React**, **Tailwind CSS**, and additional requirements.

---

## **Task Master for Dashboards (Agent, Finance, Admin) with Login Page and Role-based Routing**

### **1. Common Setup Tasks (All Dashboards)**

#### **1.1. Set Up Routing**

* **Use React Router** to handle routing between different dashboards (Agent, Finance, Admin).
* **Implement role-based routing**:

  * Only authorized users should be able to access their respective dashboards (Agent, Finance, Admin).
  * If a user is logged in but tries to access a restricted dashboard, they should be redirected to the login page.

#### **1.2. Role-Based UI**

* **Use React Context** or **Redux** to manage global state (e.g., user authentication, role).
* Ensure that only authorized users can access their respective dashboards, using **Protected Routes** for role-based access control.

  * **Agent**: Can only see Agent-specific data.
  * **Finance**: Can view financial records and all trip data.
  * **Admin**: Full access to all features (users, trips, disputes, financials).

#### **1.3. Responsive Layout**

* **Use Tailwind CSS** and **React-Bootstrap Grid** to build a mobile-first layout.
* Ensure dashboards are optimized for different screen sizes (mobile, tablet, desktop).

#### **1.4. Dashboard Header & Sidebar**

* **Shared Header**:

  * Display **user info** (name, role) and navigation links for different sections (Trips, Ledger, Disputes, Reports).
  * Use **Tailwind CSS** to style the header and ensure it's responsive.
* **Sidebar**:

  * Use **React-Bootstrap Navbar** for navigation.
  * Create collapsible sections for each role.
  * Ensure the sidebar is **responsive** and works well across screen sizes.

#### **1.5. KPI Cards**

* Display KPIs for each role:

  * **Agent**: Total Trips, Active Trips, Completed Trips, Disputes.
  * **Finance**: Total Financials, Pending Payments, Total Balance, Trips in Dispute.
  * **Admin**: Total Trips (all agents), Active Trips, Trips in Dispute, Completed Trips.
* Use **React-Bootstrap Card** components for each KPI.

---

### **2. Agent Dashboard**

#### **2.1. Dashboard Layout**

* Use **Tailwind CSS** for a **modern UI layout** with **multiple Card** components for KPIs.
* **Agent-specific KPIs**:

  * **Total Trips**: Shows the number of trips created, active, completed, and disputed.
  * **Active Trips**: Displays the number of trips that are ongoing.
  * **Trips in Dispute**: Displays the number of trips in dispute.

#### **2.2. Trip Overview Section**

* Display a **table** with the agent's trips using **React-Bootstrap Table**.

  * Columns: **Trip ID**, **Status**, **Freight**, **Route**, **Assigned Agent**.
  * **Actions**: Links to view, raise disputes.
  * Implement sorting and filtering for trip statuses (Active, Completed, Disputed).

#### **2.3. Disputes Section**

* Show **disputes raised by the agent** (if any).
* Implement a **form** to raise a new dispute (using **React-Bootstrap Form components**).
* Disputes can only be raised on **Active Trips**.

#### **2.4. Trip Creation Button**

* Add a button to **create new trips**, linking to the **trip creation form**.
* The form should include fields for **Trip Type**, **Route**, **Freight**, **Advance**, etc.

---

### **3. Finance Dashboard**

#### **3.1. Dashboard Layout**

* Use **Tailwind CSS** and **React-Bootstrap Grid** to organize the dashboard.
* **Finance-specific KPIs**:

  * **Total Trips** (for all agents).
  * **Total Financials** (sum of freight, advances, balance).
  * **Pending Payments**: Displays unsettled payments.
  * **Trips in Dispute**: Displays disputed trips across all agents.

#### **3.2. Ledger Overview**

* Display a **financial summary** for each trip using **React-Bootstrap Table**.

  * Columns: **Trip ID**, **Agent**, **Amount**, **Direction** (Credit/Debit), **Date**.
  * Include a **search bar** and **filters**.

#### **3.3. Agent Financials Section**

* Display the **total balance** for each agent.
* Show **payments made**, **pending payments**, and amounts credited or debited.
* Allow **Finance** to **add or top-up agent accounts** via a form.
* Allow **Finance** to **mark documents** (e.g., LR Sheets) as received.

#### **3.4. Reports Section**

* Display available **financial reports** (e.g., **Agent Performance**, **Total Income**).
* Enable **Finance** to **export reports** to **CSV** using **react-csv** or a similar library.

---

### **4. Admin Dashboard**

#### **4.1. Dashboard Layout**

* Use **Tailwind CSS** for layout and **React-Bootstrap Grid** for components.
* **Admin-specific KPIs**:

  * **Total Trips** (all agents).
  * **Active Trips** (number of trips currently active across agents).
  * **Completed Trips** (number of trips completed).
  * **Trips in Dispute** (total disputes in the system).

#### **4.2. Trip Management Section**

* Display a **table** of all trips using **React-Bootstrap Table**.

  * Columns: **Trip ID**, **Status**, **Agent**, **Route**, **Freight**, **Advance**, **Balance**.
* Admin can **edit**, **close**, or **resolve disputes** directly from the table.

#### **4.3. Dispute Management Section**

* Display **all disputes** (open and resolved).
* Allow **Admin** to **resolve disputes** and provide **resolution notes**.
* Implement modals or side panels to view and resolve disputes.

#### **4.4. User Management Section**

* Admin can **create**, **edit**, and **delete users** (Agent, Finance).
* Implement a form to **add users** with specific roles and permissions.

#### **4.5. Audit Logs Section**

* Display **Audit Logs** of system actions (e.g., **Trip creation**, **Dispute resolution**, **Document uploads**).
* Use **React-Bootstrap Table** to display logs, with columns for **Action**, **Actor**, **Timestamp**, and **Entity Reference**.

---

### **5. Final Touches for All Dashboards**

#### **5.1. Modals for Details**

* Use **React-Bootstrap Modals** for:

  * Viewing or editing trip details.
  * Resolving disputes.
  * Viewing ledger entries.

#### **5.2. Error Handling & Notifications**

* Implement **Toast Notifications** (using **React-Toastify**) to show success/error messages when actions are performed (e.g., **Trip created**, **Dispute raised**, **Ledger entry added**).

#### **5.3. Mobile Responsiveness**

* Ensure all dashboards are **responsive**, using Bootstrap's grid system (e.g., **col-sm**, **col-md**, etc.) to adapt to various screen sizes.
* Test layout and components on **mobile**, **tablet**, and **desktop** to ensure a smooth user experience.

---

### **6. Login and Signup Pages**

#### **6.1. Login Page**

* **Design a login page** using **Tailwind CSS** for modern UI.
* Include fields for **email** and **password**.
* Display **role-specific dashboards** after successful login (Agent, Finance, Admin).
* Add **forgot password** and **reset password** functionality.
* Use **JWT Authentication** for secure login and session management.

#### **6.2. Signup Page**

* Allow users to **sign up** based on their roles (Agent, Finance).
* Include form fields for **personal details** (name, email, password) and **role selection**.

#### **6.3. Forgot Password & Reset**

* Implement **forgot password** functionality, where users can reset their password using **email** verification.

---

### **Additional Notes**

* **Menu Structure**:

  * For each role, the **sidebar and navbar** will contain role-specific menu options.
  * Ensure the **menus** are **separate** for Agent, Finance, and Admin, so users only see what is relevant to them.
  * **Navbar and Sidebar** should be fully **responsive** and toggleable.

* **No Shared Modals**:

  * Each page should have unique modals for each role to ensure no overlap in functionality.
  * Each **menu item** should have unique actions and data, ensuring the UI remains clear and role-specific.

---

This **Task Master** includes comprehensive steps for setting up role-based dashboards, a secure **login system**, and making sure the **UI is responsive** and tailored to different user roles. If you need any more adjustments or further details, feel free to ask!
