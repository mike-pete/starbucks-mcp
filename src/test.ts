import { chromium } from 'playwright'
import xx from './main'

async function openStarbucks() {
	// Launch the browser in headed mode
	const browser = await chromium.launch({
		headless: false, // This makes the browser visible
	})

	const context = await browser.newContext()
	const page = await context.newPage()

	// Navigate to Starbucks cart
	await page.goto('https://www.starbucks.com/menu/cart')

	// Wait for network to be idle and page to be fully loaded
	await page.waitForLoadState('networkidle')
	await page.waitForLoadState('domcontentloaded')
	await page.waitForTimeout(2000) // Give extra time for IndexedDB to be ready

	// Pass xx as an argument to evaluate
	await page.evaluate((valueToStore) => {
		return new Promise((resolve, reject) => {
			let retries = 0
			const maxRetries = 3 

			function tryOpen() {
				try {
					const request = indexedDB.open('keyval-store', 1)

					request.onerror = () => {
						if (retries < maxRetries) {
							retries++
							setTimeout(tryOpen, 1000)
						} else {
							reject(request.error)
						}
					}

					request.onsuccess = () => {
						const db = request.result
						const tx = db.transaction('keyval', 'readwrite')
						const store = tx.objectStore('keyval')

						// Use the passed value
						store.put(valueToStore, 'ordering')

						tx.oncomplete = () => resolve(undefined)
						tx.onerror = () => reject(tx.error)
					}
				} catch (err) {
					if (retries < maxRetries) {
						retries++
						setTimeout(tryOpen, 1000)
					} else {
						reject(err)
					}
				}
			}

			tryOpen()
		})
	}, xx) // Pass xx here as an argument

	console.log('Successfully added value to IndexedDB')
	// Perform a hard refresh
	await page.reload({ waitUntil: 'networkidle' })
	// console.log('Page has been hard refreshed')

	// Keep browser open until user presses Enter
	console.log('Press Enter to close the browser...')
	await new Promise((resolve) => process.stdin.once('data', resolve))
	await browser.close()
}

openStarbucks().catch(console.error)

// const resp = await fetch(
// 	'https://www.starbucks.com/bff/locations?place=88 guy place san francisco',
// 	// 'https://www.starbucks.com/bff/locations?place=94105',
// 	{
// 		headers: {
// 			'x-requested-with': 'XMLHttpRequest',
// 		},
// 	}
// )

// console.log(JSON.stringify((await resp.json())[0], null, 2))

// const resp = await fetch("https://www.starbucks.com/bff/proxy/orchestra/get-store-by-number", {
//     "headers": {
//       "accept": "application/json",
//       "content-type": "application/json",
//       "x-requested-with": "XMLHttpRequest",
//       "Referer": "https://www.starbucks.com/menu",
//     },
//     "body": "{\"variables\":{\"storeNumber\":\"47903\"}}",
//     "method": "POST"
//   });

// console.log(JSON.stringify(await resp.json(), null, 2))

// const resp = await fetch("https://www.starbucks.com/bff/proxy/orchestra/price-order", {
//     "headers": {
//       "accept": "application/json",
//       "accept-language": "en-US,en;q=0.9",
//       "content-type": "application/json",
//       "newrelic": "eyJ2IjpbMCwxXSwiZCI6eyJ0eSI6IkJyb3dzZXIiLCJhYyI6IjEzMDc1MTkiLCJhcCI6IjI0NTQ5MzA1IiwiaWQiOiIxNjBlNmY5YTU3MmRkMzU5IiwidHIiOiIyZTViYmVkMWNiMzQ0NTE1ZGRkOTQzNmU3NmQ1OThjMSIsInRpIjoxNzQxNjMwNTI1ODQ5LCJ0ayI6IjEzMDYzMTIifX0=",
//       "priority": "u=1, i",
//       "sec-ch-ua": "\"Not:A-Brand\";v=\"24\", \"Chromium\";v=\"134\"",
//       "sec-ch-ua-mobile": "?0",
//       "sec-ch-ua-platform": "\"macOS\"",
//       "sec-fetch-dest": "empty",
//       "sec-fetch-mode": "cors",
//       "sec-fetch-site": "same-origin",
//       "traceparent": "00-2e5bbed1cb344515ddd9436e76d598c1-160e6f9a572dd359-01",
//       "tracestate": "1306312@nr=0-1-1307519-24549305-160e6f9a572dd359----1741630525849",
//       "x-dq7hy5l1-a": "aT5cd5IwQOMkX-DN6RVNSso8JzTxtYpSSc3BqtBCp7r0OH2DhbHuQxMwXYYDVPbUtcnKL3LtIMNVQdYnkCsX3i9gWRHz_oZ3iZVyhftQpLL5YsA5GLPf1GEjxUY_hFgCeiK1FS0d5NO5uF0XX6bk6rNIQGOsrAo8AtEj_fBuUMt4MMHUya_0fJQVE_dOygXODd3ned1i8-XX4QQLVOlOZLjoUelhbj4Bj7tj__EUkBNASTPMjouOteNi=zPxnTyy9-3dwctAMEl2PMBjeNx8qbyeDJXmA11845KpjbSQ_3pVeBjl5y78Mg7NABPUO=8x0OrH-7y3u8wjeOzjXAcPm-39My3749HTy-SrDinMQTp-E8u_N5G3OOliCpjEEZFf-2bfoCNTJwSbpLmlBV_qIF2dKQ1i0OkJNq-Rpn=IxdHWP0GehUTq5LucBhgP0wNGlqcZuC3NmnXIPhxM4rNnr3Y=IfAbln6bwPdNMebRCZ=QkN1ZT5FMLIbdTPEkG_kaGyyqrjV-p0JfmWKzV6F3jYfKi3KrYDn6_MSiwW694DlMsKOo4IX5AJ5x3D87Nt6sBfkqgeiHkhRCIGsH19ST4g7a5_TY1QnfJSNU6Ljoj9YsBjdhDYHrnTMlQcVk-ETP0AAaZpskMrATFr3gRdIXdeonLtPK_roPTE1WEQy6OWJ9-2TU-8VSewzEthQ1d-49WlODjKU-HRYpYuET-h4Aqg7EQ54ozOf7JTT0Pjs_DY6kh9d2q45glSa_NpIhrnDSibNzu7o0REWzqWBPMrN2Xw5oC6ZdXX_MEFqfmcZ7WX=u_Y_ena2D8nNtoxPoZ2T-ayWWtfWSEQU76pjfSUBxhGgiHd7Pgs=C5d36VH6s8Z71FQkBPppDsfU2tS6z4zCo5utWmiKx4OftUPrCdB6YDw51LPWIQhLZbT_=9xnL3gqqmnnj9oqZUWXR9Pc0iECoSQAqd=pwtxLyFXkEgxb66jHpC7HOu01BynDU-PJgP1PcuVs7z7k_7GCCAhA3VMVHQeyiFGRSQmDkOnCTGAd33BILanNoFKe1ZkdVc3wQ2_6aZFfHMwzRQ4hwr_MKtjecM56A_8nLNC5lTtsZ9l9W4nKFe63rQiBgPVjcQX=eHYYjmr4_ec4zjNKFxP8TLZNha_Bp_N2U6lfILS5KdY8A8sJXueDANlz__ZH5XL7JI0hpBgVS6E3FHjN6GDUrIZrikJDWoBihlUpLMKSUUBs-7eKu1K6u-3W11GTDci2PY8nsxXsMU8UKFWbl73iPr5IpJDok6qPBAQAgwk3PR-b9CqO15F9QJIFFqRnWmEjOiR=2BGHK4ZsOIBS4nMT5ukTfEQ4SwL6lhy6t0cBxFf_Oau=JS9UbmGn-oEQYgWROh6P7K0Ix9BQl6frtP0iiuJnAanehSDBNjEdH4TRYZWEtf0J-XJRHEemZ6xPhgKkZT3uC4tnmVa9EGG-04H=fNqJetiVZO6Fyh_=kCIpYoO=bLgyZeFGcXDpkIL_6b9c=j_RVKmiox0P3ftw-rEKI686IBehrdF6ISCsOX70sn6MmBy_DjoPV9wMuNQ3r_DUVeFeXaoG3rP_TBuYcGZpVJtiWWPqX2V6bPj=gSdbHfV-wr3sY39dEJcME2-PCmB=nR9wsTTwMyY0BrXdAOBx4mhTLfauy4ll71Iyi8OyV5xdjWZQREHMji02qPESgoHTgRnsxghpBjTY=qfdkjHPrMoFGxpR4zCclXfaxpp0FQ7brkiNMtNMhyIpG0HV0bzSygknxl8dt4Bc2sCLMcTyCcsRwasIWDKorr93TMx6Xrn5Je6E3=ZLfoJ4DYf5qr7hwoi-MU67nmU5b_5PelXCe2ejEsa9-BMKOVImCFdE4BxXko6e1pUYFxQq6BmVe6J1TDr0BqdKcK5VkO8o7ghuG6W46TexElIHyu=IwWu2CtPCwtxg1gOCnW6TToBO5HiAyAsKw7hahfXd-YSdOM9ZHAybGnXD5TwXswx3LsKcJqO8Hnq5Frj7_co-6gUmsOc8Qx-mNnYwsygACXXfZGE6iO2qVXmNw_fmZpikzYBfGjpepGW6ppLDlSsaMR7Q0d4ceTAoSFxGwrSmB85cHAXV8ikh_do=U4LafgufkEGeDQ_DpXuClsLWipK2xCSJ68Q1=gcQW9Zw=E6Vs28RcaOIHsAqaBhV-PGMrsAR3Lmdw8RiQJ61dRUIZ1eYUrPEpfM9SQgcgF2dZA3un_VsBX0hSmzKbTfhfXH6EVBUAJ_RTuTsm7XVT2BzR20iE6MtXegSAXQNkBymB7LGCuTXdYaiEpCZqLe5ifcN2yGkUtdMfDr8E69gneuLxUnYU=tt=cJ-hkrQsCwSTcNAeFxWshZyLXYEx-iKWPhAa07og_GEZ=Mqt4VxqGKFEgOhyDJMyAewG0FNJzDUqC1KMBVLk5_UPGcI=Z2QP8Dp-6EHSh9wGSj4WnVic4l42eeStwVu_wwHpOefYFX8zxGJa2cQ=yfIPgZnzamNiKHLajEYyUeeeYjKpx5NhgUwV4U9p7bXTJucMsnn__6N_g7VZdFqmRZwTe9QwSdj11lrwsZrIa=ODFBCrzYPkGPOXh1fIYrWlflP3953BiO4Yob5cLQ1dE6kzq=z5WI7wz-iHEQb7rIjncFT583kqZiGq0GbSg_=P6k_TxIcdqWYuIR1Jw3H7GesGDh2DiJJYgh3eCSKshHJNkFOIya-1IuDaUcV1xKNggN9UWbzn5MW2CwiG48BEGlSodiynIUoMTsAJ6T-QRASpD2CFF2Q72GZ5fLrERiBRHPyS1t0LPbMLBVX_dlPlGY6C904EFhbGS-qd-ACccmwLIr==IT7YIKXRUhXxVZCycUHkc1KEXYHRqUr0XF_5lVkxTYUL5d-p17MnykMoNQOnPyLNnu7xQQ6aj3QK680ccIUNDKA2mfDeJG9JngBAeH7zLeLbaSiy4GkZDZ0affA6lh-HbcBaVk1S22lCBizx4H-MAbgb4h8D5Q6Gu8kw1hVBud7Ng2FnythG4AUkY4HbzzJGbB2Ttnw63h4LFmJQm0jhZUrOdFTjRuqHAVCdDc-k9toK_DFujrFwwh9_yDi6IfEscbpeouH-hHmlUDKikMzJKlAtGtDpgXsn6q-uIif_J8omF1q7lE2MdM_7Tyi3l23CHGN3ntBglMn3eW1MARZqSK1E2T0c2AywXGtrP2V2i0fdw4n6hgFZYyY68ukPj7AZy6qqzq8W_Xu69ZlaCRKjuXBaXqqY4jMDZ7LKsJE93nkX53FjC-uO7Qs_rQtqLIQg7beXaOq8Qic87zir3l1ate-4W_WX2BMsXNzgw34p_S3Nzl6-uqz2XzfSYJnnyuJiotnqr9OWHeJOqS4Sr66LHtThcpxDa2C1DYya0SMLDeQW1DgoCoZJ3k_3==ZnSDAQe8FGxPhGEo=eqZYI6bgiZln6ItWgBPQD-2mImnKmeHwiJOeXFPVJy317GhzLi491eZw8SYtebPWtu=K0hDU3z10z-AIWcXb84HeOtYoexW=M8l5R3KElehZ3cqjH65VKf1B9CAKmPTKktTtgIZ00J1QufUSJsqanXt6mYqDwTpwxkZ5s_Fb7gFmPz6ec3PAR2iElOO_erYVmf3q6pSFL5_0d8A9PPGVZgWCQKaOAO8hY5ejTm1Gfw=Ceq3bsNCA_T8cdWHnXdLzpOXXgM3jI_FJQPXfrpyz-g0DK4zQCrDhxxZ8Z101pl9js0ZrZYaJ956_BhnFNnSso0Yzk6MQm_2GlOrG0iHlIijfSQtQpxdMA7dD5fISu2tsIU4c2aBM79_MzBLeaLGeVcPhk_k0Vo1rFrYCqNIH-CPZbjbk-2Ic8P7cecYycZoq8Up2qNGaadniVDsF5VaM8NkSo07CnpN6h7wi=9MUzcCNcIOjqRf-LU68qCx-RAONlgRoui19l2nHwt7fKWs6xxM4RurE9wZSZeX=Bbo4rDp5K4RILwothhExxyu4_02FUdFqwVbN6GwuAMj5rXeBscCWoxMA5aw2SDh-tKwY5JnVP7xYRVH22QXBRi8qqlMrQQAkdXijJgHqkN7NraBXG-k5foahCwjRi4C9OkeAbcRElK48-dlGHyzc8Cr3CnWfKWdbVfP=eyzPIbnM6T4pQFGPUiQSs5VDIl6ym29SCr-LBGT0cd=7irlVTIs4e94Q-qjCyexxCrJhc-209VxWxAREInEajnl59UOhOUmQItelT8AsFDCs4rUJbIgI_T9BhYV6KP6c0TR3qHKYOKt9KTkkZkXEcRj6TGDlJf4g4KyJgCTaomKSOJybzu6tzD5JZ2r4TRDZSHZ=aKBhWQPryKu61uAmnPTE4-7fLDnjw_ug31V5eK9KrrZaH7-AJ73hQcpPEplrIl2thh51eSC5C740HgLRGE1SO0KKBtqs3ZCdPOCgKiQPwg9he5mALOTaBsTqnHc7euzCVCr9LfTgFyq7d=hhDxdwgC9CxnEjoCBWax9-a42Z0QEWUyFWjQiCiTkdm3cc7pfsFWWYVPqdhxHjY7tNr8hJa3G=RuwAxqdtf9BSCxhccahs514A8e=F4rmGN9xr4H_QtcAKqYDa=sVx6OL3mTBLWe_PdMqE8PTez2_I-nyXLWFiJyO5JJE8bgSg=Lf0fOCjuAP45JSUxD8Nai8q2tgt6Nmkc8GkJNL5hl6RN_ysLERqpbUgU5sH0iwWIE=ghFROkQWFEI6O4efxOnZ6AKptJF1H8FVi7rDTE4TCZD18_b5TfjIjlOWzElRrFabW7Z44spoFCQPMJMB0_90Z05Ltc4T4AePaEokGwtIwUcV8YT8NdQ6CxQ9W_MdH8pxxmBMOQ6byGpVz7hKK5CBugz_5Pca_hOPUq4eQZpWjwxqLkZ=FOU=qQFdNTZLZXcOgD4Kqp_T=5-WQd3I3yJ8leOgBaDFzuyNUaSJcKNDOw-YignXhz4Ze0=r3Jfh_phd1DJLcMBloA9h4VVl3D=fusbxTH1OcPZkTWUxHxlsUsmxoWw11Yj2LmM_VpqQA=a2wCJ=RFa8Nw5_c2rnuMNd3IIH3rFNaWqBs8T0JP2sYoF-1dFHRJJu4XiI6jtqIf_J1MPKTlmM2mfRUuEPV6-URe7DTnfHhVo8lG7RVsI=H4zffhd_jiB1F3p3JKtRRiFjpYS2H7W_=wEQTSkJEghqMhptzmaCnOo2YSb9UUAsfi3VdE5YtL7j1rHAjsjN_Wi5THQwJCdKrXoF=cFnDCp7afu7yz9gyuTLZ50uFwEmNQNjeo0mVPzH=ysUCP9rXr41WV7zRa3ZBBFgAWJXg5ertCyJHeHSnorVR4Te0bFoHTFeYcy0KM2E0j_7SgkMtO1_-8rzZDDm8lpC1Wzb_WI8INUK0suFCcDKRs0wDtihd822syQxQM1TUY505wBb02GKHJy4KHa_Q_QqTeTVUYROHkRe7jIQLICjUY2ByAK3zmy7hPyaS5k7CzTtsOtUF5k4Ii3b7S3GnACDmKJA468SyGltBS9rlOyTOwc9klVU=QSuN7U_nPLpial6gxkE9Sqi7iG7ifwWCmfwSYgfFfnxyN5TH37QEF1ndTHxYb3a54ZzXsKb50nG2RVE614ixbM-P9X8XebzHaaXI5VB40t39SrJo0UMkpjALqEPpq3JMS84U6XbhlFMuC1CTZkLXciWP-1ofHlS5VBnGL2LPWA3EVz=BgJbf1SdnTQtJaIIZjYSNq_x5dDRLrz0XV-WJxnYhC4K_3L=mGi0xuIgdtG3sTVqKemaNAxoOryoE8fVLfF9uiFTrM=uAGVLfnxWodXDr1koxgWw3ZGBnUVpKJ-YWOjqMpIKBwlQZl7bRT-x7i5d2mmdgPPFZQMyzuBD0hwGYe3TqidJO3udmbzE0pV-BnwQGw3IDA4wudV=wMQI5l6jQfzTbtiXExioC2PxwlzlNcGcFmOj7l1V1zV7V=ugcN9zBgPC5BcuaA=7lOz5o0mjsPw_WPod=R_EWQGB37RpWaewJ5tWpKxWQRhiIXPD5=IFNy0RSxTm8V1M6EiQM6Qj9l9Hp90NlYt1ZBnNwj7zEVbSF2Im_Og9x-pRnurZ6uczxeMlLENe4Zb3O9nNP08jS8P-BMi_z4DG_HLggPnrEFXAfzrC3O1VyRmSqt51wVtEtY017=P179ca4ZapOKTrwrsYZ-5IMnCK3CQUPKLXutCRFYw1K-R6M-MIfqxT6ptsKPWXUcdOVfl6EVHxLC31lBiBgrAuQ-YrLgeXNfZefAZ1BnzW4FPRMnSnMV7Ejx3JU8iRzuMOCNV10oPR7wyy-1NhZ1902Odxsnr03V8OCVWPjjhrIb8atSoSZkhpqYAuKE4oKZiq9aNFcnGkZkNgqbjTOHd6E8SL5X3cFygFu5uwc1BdJ14dqtLOP5md7fYdr2HHgjcVHa8HMSkpa1Erk7_cmQy55O9jJ_iHksakMPEgHu_37J9wOqlX6IDNSyUGQsFuVdRMFTm561gyU4YoPKxjtOoctdhiSjoJoQTriueWxzMx125bSsmrpTc9SVU=wtrWEtKF20iDd5SygAeTOWgfrtMxZ-KVaoy7hn9=H-Czb5gsSjTa0g5rMekcEY_PL3nE5s85sIIWgr203Z8jc2mH4LJWd2EPUAJC-NyN-UKx8tSLy2IFZ3o3XA3qY4FsCiCXS8bqCgml14tiDQcUQyUDDfL3hErc-qe_0RfAkFDD4wqgPfrr2_BZ0YSb5bT4=yaq0L3LVyhWO7xRi5NmhT9Nk7hFSExXFw8LtCMz8RPGnYzZb9kGI0pksOzpW8ggjIuW5c5HVptVw0tbDDq6ElV1_QcSDyMC-Kd4d0Wb0doOcHTu=PdlrYiZ6-nIhwR6fOB7H-NR25lU0Go0=xnJuEP3Fo4ZCnkrHfldpkuizcInH4eh_0w4GZnuAnXcN3q6zs-k=4YIAc52dY1wm8hqFb7FhwkVgSj83REcM7=EGbNl9CaIyRufjsjSeU7I5kwqjwAonD9YbIVa9HwpUraB2VFqpqy=xNA4_pgYF-inb3Uw7JoCD5tZ_elVrT0wVup3kH4EoiDALcDE-ffVdOtk=TgS4MjBa8XzDxB-2dQ7GZOhRO3LHtOhwwfWgPnmA6M-tObYMUwOQABHU2Vp21ll_g=S5RMeXqT5k8bITkblSlYAVASxjKCVeD8rJL9_2saj-Wouj4UuIZX-=n_8QUDz-yc-iZCGGuia_HkFf_8M1DJ1g8hP0utBkZ4zCpqaWf8HFN0V4SpAdOMP_9Kxfj11qtUNShWHRQ2MKgJ0zFQ0RZT1crichgXoa=4c32fuPFjF2S02S=qBBTN-CN0BypCMqCW-GG2wzGxLd2aWGSUHo3TmWTmeYQUOAibW9jPuMidWOtPKceQL84r5eMhxxJtmXOMm-9zJxEFG=TbBlVUal5yjkIi78m5mAMLA4yFIXHadr0Yb5gizWqbTp3Z53EQGxuhjNwWsVp5EYfwALOcFJ38_wkEqFbOdfPTtOmsRpMhOq6hfoZeeXd2oRo=-Ba-Rm75NO26BHB8jeaa6ZMJW584yJy-SooNFus91BdF7esW9Ys1W2EfRFwKgVJMmKIYI5KYnyuKwqu2Eiqkqg3dsfZJkA4L87wi6OlzjA3rKWj7G4ChiF3cLSmu01YJHwPXuit4Cr-GVh-5ibjBXhlWCSrCj8CsE=3sRkksBSY=asBUlHUucsuy=9P3w_mBG8KPAT-uqXHU_dgh58J4ywhTkN3u0ZaDiiwONRtkfSnFNV4LIsWtHKXPDHxXi_xNGonOYorBd6nNLLNerzlUmWcuBZtbKNu5C5Ije3KJtRr5e450K3nC69A1LLexMkTdSqq658h6RISEir-xf3dwiy-t0X9Zz16UPnbtaDgP5RTW1mH6M=D5NYKQEfMrynUN-CMib0NBmCH4hdP1AbhtnzCB0zzunu0yJEK",
//       "x-dq7hy5l1-a0": "iOfCHqqTR=jEOr_68GSYtD8RxFWebcgZX42A-l6=Xx9LFLl2Q1CWm-VX_51UPwCllX3cwWaTgROGxBb1IWbkIzBup0TcDIOUDzC3PWaUQlEmOqDK4z8JLuclIcXwN0J032ChUVIgr8VU1Q1TYWq1VzzLVgi5dXyHDzrDI9YK9agQ2Q6R3uNH0K-BnVH-EPp_KDfjzTR9tUEj71=pCxNBPAKNjz_J3lxbfZQsUuGXh8hIZmUYmCQeUBEY47GKXmhR2SWQB04UxssEQREyO91h2pUxaLeh5MA2itkYA5BGqKu-2so5IQqgU__8dCiX_Rpw65xnh5nVSdCSyMkWqBEOeBtMRIBHKKxT9R",
//       "x-dq7hy5l1-b": "gonj95",
//       "x-dq7hy5l1-c": "AACxNoGVAQAAvJ3Zjg2NSGmnUjiFLOn261hkXC9Ego-lxPRWHxK1_sEq_Tbh",
//       "x-dq7hy5l1-d": "ABaAhIDBCKGFgQGAAYIQgISigaIAwBGAzvpizi_33wcStf7BKv024f____-T_bEhAe2bSoUDPlBc3286u-SHrH4",
//       "x-dq7hy5l1-f": "AxZURIGVAQAAuIBmGPVcf_2GuO8_GbdGuff7ax4CstJ30jKLNuTig-IcyZSNAYgY2mOuckX5wH9eCOfvosJeCA==",
//       "x-dq7hy5l1-z": "q",
//       "x-requested-with": "XMLHttpRequest",
//       "cookie": "optimizelyEndUserId=oeu1741365800255r0.6901317401034972; ux_exp_id=6f3723b7-8233-4140-88b3-44e85dce8340; ASLBSA=00038f952e2a0e4383b269b31ee1c78eb55416d298f826927ef4ff9ef6ab361c81bb; ASLBSACORS=00038f952e2a0e4383b269b31ee1c78eb55416d298f826927ef4ff9ef6ab361c81bb; fp_token_7c6a6574-f011-4c9a-abdd-9894a102ccef=g7YvvucMrhP3pcHCgLkPIVxTb7F3DYfP3sOrTVDbe+c=; optimizelySession=0; .SbuxExtended=FD9D7085CC5571E7D41FDDC2A857BA21F25A1EF8A99EAB78CBFA5C850ADAD934C39A939EC7418B49FD06D312324A44059F96F4F979E8C8F3CBF061785D6CA48EEF79B8F0CD8C41C9A423273A37DC02FEFEDF6EB35379756753792CE6F0E0110D04C1005F420B5BC833D4ACB94A7588A309433F2EBF883540AA87D3C7A0F3D197A04079D38A7C0D43B3EDB060AA559980EE0FBA86755F3A8FA53E9217BCA63AEF127D3F54DD1FB78639E5940CD7287FC5D7B9D0404911F7AD276E6147F33A93ECA4073FA833DFEC2433761A0676A5651ED11012D7B68DC809C683E9F71DAA4FC90E24CE0F5201E909897FB0258579499588C12EE6DC6C833E351D266E052D41EB086DFA20770857867B6F3BAF8A627BE11E39F0EA06CB637526200843E3006BC56FC5D433DAAF82DF78099B03C77BBF5DB85B8C56E3534DD7D484B91D1A3063E6; s_check=%7B%22value%22%3A%22d6599070-fdd5-11ef-b074-fbf311cc3272%22%2C%22extended%22%3A1744220033783%7D; TAsessionID=e81babf2-3616-499a-b670-1fa4a9908439|EXISTING; cfq3cTKk; notice_behavior=implied,us; notice_gdpr_prefs=0,1,2:; notice_preferences=2:; cmapi_gtm_bl=; cmapi_cookie_privacy=permit 1,2,3; tiWQK2tY=A2KCfXGVAQAAhD1m5I6XkUScxaF12V-hrgdfuuGA8DfxpxhPR3grTui6jFmMAYgY2mOuckX5wH9eCOfvosJeCA|1|1|8ed1c4a27e4102e67759b43d38a817fb371e778f",
//       "Referer": "https://www.starbucks.com/menu/cart",
//       "Referrer-Policy": "strict-origin-when-cross-origin"
//     },
//     "body": "{\"variables\":{\"order\":{\"cart\":{\"items\":[{\"quantity\":1,\"commerce\":{\"sku\":\"11044803\"},\"childItems\":[],\"key\":\"2121255/iced:Grande-0\"},{\"quantity\":1,\"commerce\":{\"sku\":\"11168400\"},\"childItems\":[],\"key\":\"2124867/hot:Grande-0\"},{\"quantity\":1,\"commerce\":{\"sku\":\"11168398\"},\"childItems\":[{\"quantity\":1,\"commerce\":{\"sku\":\"154162\"}}],\"key\":\"2124867/hot:Short::91(1)(a)-0\"}],\"offers\":[]},\"fulfillment\":{\"consumptionType\":\"CONSUME_OUT_OF_STORE\",\"collectionType\":\"IN_STORE\"},\"storeNumber\":\"47903-260244\"}}}",
//     "method": "POST"
//   });

// console.log(resp, '\n\n\n\n')
// const json = await resp.json()
// console.log(JSON.stringify(json, null, 2))

// https://app.starbucks.com/bff/ordering/menu
// https://www.starbucks.com/bff/ordering/menu?storeNumber=47903
// https://app.starbucks.com/bff/ordering/2121255/iced
// https://www.starbucks.com/bff/ordering/2124867/hot?storeNumber=47903
// https://www.starbucks.com/bff/proxy/orchestra/get-store-by-number
