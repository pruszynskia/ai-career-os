import http from 'node:http';
import type { AddressInfo } from 'node:net';

import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import {
  OfferFetchError,
  fetchAndStripUrl,
  isPrivateOrReservedIp,
} from './extract-offer-text';

describe('isPrivateOrReservedIp', () => {
  it.each([
    '127.0.0.1',
    '10.1.2.3',
    '172.16.0.1',
    '192.168.1.1',
    '169.254.169.254',
    '100.64.0.1',
    '0.0.0.0',
    '192.0.0.1',
    '198.18.0.1',
    '224.0.0.1',
    '255.255.255.255',
    '::',
    '::1',
    '::ffff:127.0.0.1',
    '::ffff:7f00:1',
    '::ffff:a9fe:a9fe',
    'fd00::1',
    'fe80::1',
    'ff02::1',
    '64:ff9b::7f00:1',
    '2002:7f00:1::',
    'not-an-ip',
  ])('blocks %s', (ip) => {
    expect(isPrivateOrReservedIp(ip)).toBe(true);
  });

  it.each(['8.8.8.8', '1.1.1.1', '::ffff:8.8.8.8', '2606:4700::1111'])(
    'allows %s',
    (ip) => {
      expect(isPrivateOrReservedIp(ip)).toBe(false);
    },
  );
});

describe('fetchAndStripUrl', () => {
  let server: http.Server;
  let port: number;
  let hits = 0;

  beforeAll(async () => {
    server = http.createServer((_req, res) => {
      hits++;
      res.end('<p>internal</p>');
    });
    await new Promise<void>((resolve) => server.listen(0, resolve));
    port = (server.address() as AddressInfo).port;
  });

  afterAll(() => {
    server.close();
  });

  it.each(['127.0.0.1', '[::1]', 'localhost'])(
    'never connects to %s',
    async (host) => {
      await expect(
        fetchAndStripUrl(`http://${host}:${port}/`),
      ).rejects.toBeInstanceOf(OfferFetchError);
      expect(hits).toBe(0);
    },
  );
});
