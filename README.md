# WebRTC Snapshot Server

This container provides a lightweight snapshot service for Milestone XProtect systems using WebRTC and Puppeteer. It connects to the VMS via the WebRTC API and captures a single JPEG frame from the video stream, ideal for embedding in dashboards or forwarding to third-party systems.

---

## 📦 Features

* WebRTC-based video frame capture using Puppeteer
* Single-frame snapshot returned as JPEG image
* Support for authentication via query parameters
* Timestamped playback (past frame snapshot)
* Works headless inside Docker
* Lightweight and fast

---

## 🚀 Quick Start using Docker Hub

This container is prebuilt and available at:

```
docker pull bartuzisolutions/webrtc_snapshot:latest
```

### 🔧 Run it with `host` networking:

```bash
docker run -d \
  --name webrtc_snapshot \
  --network host \
  bartuzisolutions/webrtc_snapshot:latest
```

> ⚠️ `--network host` is required so the container can communicate with your VMS server over the LAN.

---

## 🌐 Endpoint

Once running, the server listens on:

```
http://<container-host-ip>:3000/snapshot
```

---

## 📟 API Usage

### 📸 Fetch a snapshot:

```http
GET /snapshot
```

### 🔐 Required Query Parameters:

| Parameter   | Description                                      |
| ----------- | ------------------------------------------------ |
| `serverIp`  | IP address of the XProtect VMS server            |
| `username`  | (Optional if using token) API user               |
| `password`  | (Optional if using token) API password           |
| `deviceId`  | Camera device ID (GUID format)                   |
| `timestamp` | (Optional) ISO 8601 timestamp for playback frame |

### 🔐 Optional Authorization Header (not implemented, nice to have if token is already available):

```http
Authorization: Bearer <access_token>
```

> If the `Authorization` header is included, it overrides username/password.

---

### ✅ Example Request:

#### With username/password:

```
http://192.168.1.100:3000/snapshot?serverIp=192.168.1.200&username=APIUser&password=Secret123&deviceId=<camera-guid>
```

#### With token:

```bash
curl -H "Authorization: Bearer eyJ..." \
     "http://192.168.1.100:3000/snapshot?serverIp=192.168.1.200&deviceId=<camera-guid>"
```

---

## 🐳 Building the Container Yourself

If you want to build it manually:

```bash
git clone https://github.com/<your-org>/webrtc_snapshot.git
cd webrtc_snapshot
docker build -t webrtc_snapshot .
```

Then run it with:

```bash
docker run -d --network host webrtc_snapshot
```

---

## 🛠 Requirements

* Your Milestone XProtect VMS must have:

  * WebRTC API enabled
  * The user must have playback and video access
  * Cameras must support H.264
  * You must have appsettings.production.json file in your milestone installation here -> C:\Program Files\Milestone\XProtect API Gateway
with the following content:
```json
{
  "CORS": {
    "Enabled": true,
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "*",
    "Access-Control-Allow-Methods": "*"
  }
}
```

---

## 📁 File Structure

```
.
├── Dockerfile
├── package.json
├── server.js
└── public/
    ├── index.html
    ├── main.js
    ├── rest.js
    ├── tokenCommunication.js
    └── main.css
```

---

## 🤔 Notes

* The container runs headless Chromium via Puppeteer.
* A snapshot is only captured once the video track is ready.
* Any failures (e.g., wrong credentials, no stream, network) will return HTTP 500.

---

## 🤝 License

MIT

---

## 👤 Maintainer

[@bartuzisolutions](https://github.com/lbartuzi/)
