document.querySelector("[id^=single_button]").click();
const mut = new MutationObserver(() =>
								 {
									 if (document.querySelector("[id^=id_yuiconfirmyes]"))
										 document.querySelector("[id^=id_yuiconfirmyes]").click()
								 }
);

mut.observe(document, { attributes: false, childList: true, subtree: true });
