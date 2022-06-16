//env initialize
require("dotenv").config();

//import all require dependencies
const mongoose = require("mongoose");
const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cors = require("cors");

//express initialize
const app = express();

//port
const port = process.env.PORT || 8000;

//define or require all routes
const authroutes = require("./routes/auth");
const planroutes = require("./routes/plan");
const superadminroutes = require("./routes/superadmin");
const schooldocroutes = require("./routes/schooldetails");
const schooladminroutes = require("./routes/schoolAdmin");
const staffroutes = require("./routes/staff");
const studentroutes = require("./routes/student");
const classroutes = require("./routes/class");
const sectionroutes = require("./routes/section");
const supportroutes = require("./routes/support");
const subjectroutes = require("./routes/subject");
const paymentroutes = require("./routes/payments");
const sessionroutes = require("./routes/session");
const eventroutes = require("./routes/event");
const timetableroutes = require("./routes/timetable");
const attendanceroutes = require("./routes/attendance");
const staffAttendanceroutes = require("./routes/staffAttendance");
const departmentroutes = require("./routes/department");
const canteenroutes = require("./routes/canteen");
const transportationroutes = require("./routes/transportation");
const bookroutes = require("./routes/book");
const librariesectionroutes = require("./routes/librarie_section");
const hostelroutes = require("./routes/hostel");
const librarieshelfroutes = require("./routes/librarie_shelf");
const librariehistoryroutes = require("./routes/librarie_history");
const roleroute = require("./routes/role");
const feesroute = require("./routes/fees");
const penaltyroute = require("./routes/penalty");
const leaveroutes = require("./routes/leave");
const classfeesroute = require("./routes/classfees");
const categoryroutes = require("./routes/category");
const productroutes = require("./routes/product");
const orderroutes = require("./routes/order")
//define all mobile routes

const staffroute = require("./routes/mobile/staff");
const studentroute = require("./routes/mobile/student");
const attendanceroute = require("./routes/mobile/attendance");
const schoolDetailroute = require("./routes/mobile/schooldetails");
const eventroute = require("./routes/mobile/event");
const timetableroute = require("./routes/mobile/timetable");
const canteenroute = require("./routes/mobile/canteen");
const transportationroute = require("./routes/mobile/transportation");
const librarysectionroute = require("./routes/mobile/library_section")
const libraryshelfroute = require("./routes/mobile/library_shelf")
const librarybookroute = require("./routes/mobile/library_book")
const libraryhistoryroute = require("./routes/mobile/library_history");
const staffAttendanceroute = require("./routes/mobile/staffAttendance");
const leaveroute = require("./routes/mobile/leave");
//middlewares
app.use(bodyParser.json());
app.use(cookieParser());
app.use(cors());

//create middleware for APIs
app.use("/api", authroutes);
app.use("/api", superadminroutes);
app.use("/api", schooladminroutes);
app.use("/api", schooldocroutes);
app.use("/api", planroutes);
app.use("/api", departmentroutes);
app.use("/api", staffroutes);
app.use("/api", studentroutes);
app.use("/api", classroutes);
app.use("/api", sectionroutes);
app.use("/api", supportroutes);
app.use("/api", subjectroutes);
app.use("/api", paymentroutes);
app.use("/api", sessionroutes);
app.use("/api", eventroutes);
app.use("/api", timetableroutes);
app.use("/api", attendanceroutes);
app.use("/api", staffAttendanceroutes);
app.use("/api", canteenroutes);
app.use("/api", transportationroutes);
app.use("/api", bookroutes);
app.use("/api", librariesectionroutes);
app.use("/api", librarieshelfroutes);
app.use("/api", librariehistoryroutes);
app.use("/api", roleroute);
app.use("/api", feesroute);
app.use("/api", penaltyroute);
app.use("/api", leaveroutes);
app.use("/api", classfeesroute);
app.use("/api",categoryroutes);
app.use("/api",productroutes);
app.use("/api",orderroutes);
app.use("/api",hostelroutes);

//mobile APIs

app.use("/api/mobile", staffroute);
app.use("/api/mobile", studentroute);
app.use("/api/mobile", attendanceroute);
app.use("/api/mobile", schoolDetailroute);
app.use("/api/mobile", eventroute);
app.use("/api/mobile", timetableroute);
app.use("/api/mobile", canteenroute);
app.use("/api/mobile", transportationroute);
app.use("/api/mobile", librarysectionroute);
app.use("/api/mobile", libraryshelfroute);
app.use("/api/mobile", librarybookroute);
app.use("/api/mobile", libraryhistoryroute);
app.use("/api/mobile", staffAttendanceroute);
app.use("/api/mobile", leaveroute);
//DB Connection
try {
  mongoose
    .connect(process.env.DATABASE, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    })
    .then(() => {
      console.log("Database is Connected Successfully");
    });
} catch (error) {
  console.log(error);
}

app.listen(port, () => {
  console.log(`Server is Running.....At ${port}`);
});
