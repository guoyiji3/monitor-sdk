import type { StrictRequest, DefaultBodyType, PathParams } from 'msw';
import { http, HttpResponse, delay } from 'msw';
import { parseUrlSearch } from '../packages/luban-core';

async function result(request: StrictRequest<DefaultBodyType>, hasBody: boolean) {
  const body = { args: parseUrlSearch(request.url), data: {} };

  if (hasBody) {
    body.data = (await request.json()) as Record<string, any>;
  }

  return HttpResponse.json(body);
}

function status(code: number) {
  return new HttpResponse(null, { status: code });
}

async function delayGet(params: PathParams, request: StrictRequest<DefaultBodyType>, hasBody: boolean) {
  await delay(+params.milliseconds);

  return result(request, hasBody);
}

async function javaSuccess(request: StrictRequest<DefaultBodyType>, hasBody: boolean) {
  const data = { args: parseUrlSearch(request.url), data: {} };

  if (hasBody) {
    data.data = (await request.json()) as Record<string, any>;
  }

  return HttpResponse.json({ data, code: 1, mes: '成功!', status: 1 });
}

async function goSuccess(request: StrictRequest<DefaultBodyType>, hasBody: boolean) {
  const data = { args: parseUrlSearch(request.url), data: {} };

  if (hasBody) {
    data.data = (await request.json()) as Record<string, any>;
  }

  return HttpResponse.json({ data, result_code: 1, mes: '成功!', error_msg: 'OK', error_code: '200' });
}

const baseURL = 'http://localhost:3000';

const handlers = [
  http.get(baseURL + '/get', ({ request }) => result(request, false)),
  http.get(baseURL + '/get/delay/:milliseconds', ({ request, params }) => delayGet(params, request, false)),
  http.post(baseURL + '/post', ({ request }) => result(request, true)),
  http.post(baseURL + '/status/:status', ({ request, params }) => status(+params['status'])),
  http.put(baseURL + '/put', ({ request }) => result(request, true)),
  http.delete(baseURL + '/delete', ({ request }) => result(request, true)),
  http.get(baseURL + '/java/success', ({ request }) => javaSuccess(request, false)),
  http.get(baseURL + '/go/success', ({ request }) => goSuccess(request, false)),
  http.post(baseURL + '/go/success', ({ request }) => goSuccess(request, true)),
  http.put(baseURL + '/go/success', ({ request }) => goSuccess(request, true)),
  http.delete(baseURL + '/go/success', ({ request }) => goSuccess(request, true))
];

export default handlers;
