/*
 * Copyright © 2018 Lisk Foundation
 *
 * See the LICENSE file at the top-level directory of this distribution
 * for licensing information.
 *
 * Unless otherwise agreed in a custom licensing agreement with the Lisk Foundation,
 * no part of this software, including this file, may be copied, modified,
 * propagated, or distributed except according to the terms contained in the
 * LICENSE file.
 *
 * Removal or modification of this copyright notice is prohibited.
 */
'use strict';

var crypto = require('crypto');

var ed = require('../../../helpers/ed');

describe('ed', () => {
	describe('makeKeypair', () => {
		var keys;

		before(() => {
			var randomstring = 'ABCDE';
			var hash = crypto
				.createHash('sha256')
				.update(randomstring, 'utf8')
				.digest();
			keys = ed.makeKeypair(hash);
		});

		it('should create keypair from a random string', () => {
			expect(keys).to.have.a.property('privateKey');
			expect(keys).to.have.a.property('publicKey');
		});

		it('should create a publicKey as a Buffer type', () => {
			expect(Buffer.isBuffer(keys.publicKey)).to.be.ok;
		});

		it('should create a privateKey should have be a Buffer type', () => {
			expect(Buffer.isBuffer(keys.privateKey)).to.be.ok;
		});
	});

	describe('sign', () => {
		var keys;
		var messageToSign = {
			field: 'value',
		};

		before(() => {
			var randomstring = 'ABCDE';
			var hash = crypto
				.createHash('sha256')
				.update(randomstring, 'utf8')
				.digest();
			keys = ed.makeKeypair(hash);
		});

		it('should create signature as Buffer from data as Buffer and privateKey', () => {
			var signature = ed.sign(
				Buffer.from(JSON.stringify(messageToSign)),
				keys.privateKey
			);
			expect(Buffer.isBuffer(signature)).to.be.ok;
		});

		it('should create signature as Buffer from data as Buffer and a privateKey after Buffer.from function applied on it', () => {
			var signature = ed.sign(
				Buffer.from(JSON.stringify(messageToSign)),
				Buffer.from(keys.privateKey, 'hex')
			);
			expect(Buffer.isBuffer(signature)).to.be.ok;
		});

		it('should throw error when passing string as message to sign', () => {
			expect(
				ed.sign.bind(null, JSON.stringify(messageToSign), keys.privateKey)
			).to.throw('argument message must be a buffer');
		});

		it('should throw error when passing JSON as message to sign', () => {
			expect(ed.sign.bind(null, messageToSign, keys.privateKey)).to.throw(
				'argument message must be a buffer'
			);
		});
	});

	describe('verify', () => {
		var keys;
		var signature;
		var messageToSign = {
			field: 'value',
		};

		before(() => {
			var randomstring = 'ABCDE';
			var hash = crypto
				.createHash('sha256')
				.update(randomstring, 'utf8')
				.digest();
			keys = ed.makeKeypair(hash);
			signature = ed.sign(
				Buffer.from(JSON.stringify(messageToSign)),
				keys.privateKey
			);
		});

		it('should return true when valid Buffer signature is checked with matching Buffer public key and valid Buffer message', () => {
			var verified = ed.verify(
				Buffer.from(JSON.stringify(messageToSign)),
				signature,
				keys.publicKey
			);
			expect(verified).to.be.ok;
		});

		it('should return false when malformed signature is checked with Buffer public key', () => {
			var wrongSignature = ed.sign(
				Buffer.from(JSON.stringify('wrong message')),
				keys.privateKey
			);
			var verified = ed.verify(
				Buffer.from(JSON.stringify(messageToSign)),
				wrongSignature,
				keys.publicKey
			);
			expect(verified).not.to.be.ok;
		});

		it('should return false proper signature and proper publicKey is check against malformed data', () => {
			var verified = ed.verify(
				Buffer.from('malformed data'),
				signature,
				keys.publicKey
			);
			expect(verified).not.to.be.ok;
		});

		it('should throw an error when proper non hex string signature is checked with matching string hex public key', () => {
			expect(
				ed.verify.bind(
					null,
					Buffer.from(JSON.stringify(messageToSign)),
					signature.toString(),
					keys.publicKey.toString('hex')
				)
			).to.throw();
		});

		it('should throw an error when proper non hex string signature is checked with matching string non hex public key', () => {
			expect(
				ed.verify.bind(
					null,
					Buffer.from(JSON.stringify(messageToSign)),
					signature.toString('hex'),
					keys.publicKey.toString()
				)
			).to.throw();
		});
	});
});
