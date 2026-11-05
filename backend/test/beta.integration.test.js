const assert = require('node:assert/strict');
const test = require('node:test');
const db = require('../config/db');
const app = require('../app');
const ensureBetaSchema = require('../config/betaSchema');

let server;
let baseUrl;
let alice;
let bob;
let alicePrivateNoteId;
let shareId;

const unique = `beta_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
const aliceAccount = {
  username: `Alice${unique.slice(-8)}`,
  email: `alice.${unique}@example.com`,
  password: 'password123',
};
const bobAccount = {
  username: `Bob${unique.slice(-8)}`,
  email: `bob.${unique}@example.com`,
  password: 'password123',
};

async function request(path, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });
  let body = null;
  if (response.status !== 204) body = await response.json();
  return { response, body };
}

function auth(token) {
  return { Authorization: `Bearer ${token}` };
}

test.before(async () => {
  await ensureBetaSchema();
  server = app.listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}/api`;

  const aliceRegister = await request('/auth/register', {
    method: 'POST',
    body: JSON.stringify(aliceAccount),
  });
  assert.equal(aliceRegister.response.status, 201);

  const bobRegister = await request('/auth/register', {
    method: 'POST',
    body: JSON.stringify(bobAccount),
  });
  assert.equal(bobRegister.response.status, 201);

  const aliceLogin = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email: aliceAccount.email,
      password: aliceAccount.password,
    }),
  });
  const bobLogin = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email: bobAccount.email,
      password: bobAccount.password,
    }),
  });
  assert.equal(aliceLogin.response.status, 200);
  assert.equal(bobLogin.response.status, 200);
  alice = aliceLogin.body.data;
  bob = bobLogin.body.data;
});

test.after(async () => {
  if (server) await new Promise((resolve) => server.close(resolve));
  const [users] = await db.execute(
    'SELECT id FROM users WHERE email IN (?, ?)',
    [aliceAccount.email, bobAccount.email]
  );
  const ids = users.map((user) => user.id);
  if (ids.length) {
    await db.query(`DELETE FROM notes WHERE user_id IN (${ids.map(() => '?').join(',')})`, ids);
    await db.query(`DELETE FROM users WHERE id IN (${ids.map(() => '?').join(',')})`, ids);
  }
  await db.end();
});

test('protects notes API and supports CRUD', async () => {
  const unauthenticated = await request('/notes');
  assert.equal(unauthenticated.response.status, 401);

  const created = await request('/notes', {
    method: 'POST',
    headers: { ...auth(alice.token), 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: 'Private note', content: 'alpha beta' }),
  });
  assert.equal(created.response.status, 201);
  alicePrivateNoteId = created.body.data.id;

  const listed = await request('/notes?search=beta', {
    headers: { ...auth(alice.token), 'Content-Type': 'application/json' },
  });
  assert.equal(listed.response.status, 200);
  assert.equal(listed.body.data.length, 1);

  const updated = await request(`/notes/${alicePrivateNoteId}`, {
    method: 'PATCH',
    headers: auth(alice.token),
    body: JSON.stringify({ title: 'Updated private note' }),
  });
  assert.equal(updated.response.status, 200);
  assert.equal(updated.body.data.title, 'Updated private note');
});

test('imports text and rejects unsupported files', async () => {
  const imported = await request('/notes/import', {
    method: 'POST',
    headers: auth(alice.token),
    body: JSON.stringify({
      filename: 'meeting.txt',
      mimeType: 'text/plain',
      content: 'Imported meeting notes',
    }),
  });
  assert.equal(imported.response.status, 201);
  assert.equal(imported.body.data.content, 'Imported meeting notes');

  const importedImage = await request('/notes/import', {
    method: 'POST',
    headers: auth(alice.token),
    body: JSON.stringify({
      filename: 'diagram.png',
      mimeType: 'image/png',
      content: Buffer.from('test image').toString('base64'),
    }),
  });
  assert.equal(importedImage.response.status, 201);
  assert.match(importedImage.body.data.content, /^!\[diagram\.png\]\(data:image\/png;base64,/);

  const rejected = await request('/notes/import', {
    method: 'POST',
    headers: auth(alice.token),
    body: JSON.stringify({
      filename: 'archive.zip',
      mimeType: 'application/zip',
      content: 'not supported',
    }),
  });
  assert.equal(rejected.response.status, 400);
});

test('uploads and serves note images only to authorized users', async () => {
  const uploadedResponse = await fetch(
    `${baseUrl}/notes/${alicePrivateNoteId}/images`,
    {
      method: 'POST',
      headers: { ...auth(alice.token), 'Content-Type': 'application/json' },
      body: JSON.stringify({
        filename: 'diagram.png',
        mimeType: 'image/png',
        content: Buffer.from('test image').toString('base64'),
      }),
    }
  );
  const uploaded = await uploadedResponse.json();
  assert.equal(uploadedResponse.status, 201);
  assert.equal(uploaded.data.mime_type, 'image/png');
  assert.match(uploaded.data.url, /^\/api\/images\/\d+$/);

  const imageResponse = await fetch(`${baseUrl.replace('/api', '')}${uploaded.data.url}`, {
    headers: auth(alice.token),
  });
  assert.equal(imageResponse.status, 200);
  assert.equal(imageResponse.headers.get('content-type'), 'image/png');
  assert.equal(Buffer.from(await imageResponse.arrayBuffer()).toString(), 'test image');

  const unauthorizedResponse = await fetch(
    `${baseUrl.replace('/api', '')}${uploaded.data.url}`,
    { headers: auth(bob.token) }
  );
  assert.equal(unauthorizedResponse.status, 404);

  const unauthorizedDeleteResponse = await fetch(
    `${baseUrl.replace('/api', '')}${uploaded.data.url}`,
    { method: 'DELETE', headers: auth(bob.token) }
  );
  assert.equal(unauthorizedDeleteResponse.status, 404);

  const deletedResponse = await fetch(
    `${baseUrl.replace('/api', '')}${uploaded.data.url}`,
    { method: 'DELETE', headers: auth(alice.token) }
  );
  assert.equal(deletedResponse.status, 204);
});

test('shares notes with view and edit permissions', async () => {
  const createdShare = await request(`/notes/${alicePrivateNoteId}/shares`, {
    method: 'POST',
    headers: auth(alice.token),
    body: JSON.stringify({
      email: bobAccount.email,
      permission: 'view',
    }),
  });
  assert.equal(createdShare.response.status, 201);
  shareId = createdShare.body.data.id;

  const sharedList = await request('/shared-notes', {
    headers: auth(bob.token),
  });
  assert.equal(sharedList.response.status, 200);
  assert.equal(sharedList.body.data.length, 1);
  assert.equal(sharedList.body.data[0].permission, 'view');

  const deniedUpdate = await request(`/shared-notes/${alicePrivateNoteId}`, {
    method: 'PATCH',
    headers: auth(bob.token),
    body: JSON.stringify({ content: 'should fail' }),
  });
  assert.equal(deniedUpdate.response.status, 403);

  const permissionUpdate = await request(
    `/notes/${alicePrivateNoteId}/shares/${shareId}`,
    {
      method: 'PATCH',
      headers: auth(alice.token),
      body: JSON.stringify({ permission: 'edit' }),
    }
  );
  assert.equal(permissionUpdate.response.status, 200);

  const allowedUpdate = await request(`/shared-notes/${alicePrivateNoteId}`, {
    method: 'PATCH',
    headers: auth(bob.token),
    body: JSON.stringify({ content: 'edited by Bob' }),
  });
  assert.equal(allowedUpdate.response.status, 200);
  assert.equal(allowedUpdate.body.data.content, 'edited by Bob');
});

test('prevents cross-user access and validates input', async () => {
  const privateRead = await request(`/notes/${alicePrivateNoteId}`, {
    headers: auth(bob.token),
  });
  assert.equal(privateRead.response.status, 404);

  const invalid = await request(`/notes/${alicePrivateNoteId}`, {
    method: 'PATCH',
    headers: auth(alice.token),
    body: JSON.stringify({ title: 'a'.repeat(101) }),
  });
  assert.equal(invalid.response.status, 400);

  const removed = await request(
    `/notes/${alicePrivateNoteId}/shares/${shareId}`,
    {
      method: 'DELETE',
      headers: auth(alice.token),
    }
  );
  assert.equal(removed.response.status, 204);
});
