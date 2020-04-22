function get_dbid()
{
	if (URLSearchParams)
	{
		return new URLSearchParams(location.search).get('id');
	}
	else
	{
		return location.search.match(/(?<=id=)\d+/gi)[0];
	}
}


function find_submit_form()
{
	return document.querySelector(".quizstartbuttondiv").firstElementChild;
}

// SET accomplish_prec
function main()
{
	const id = get_dbid();
	sessionStorage.setItem("id", id);
	chrome.storage.local.get([id, "accomplish_prec"],
							 (lst) =>
							 {
								 if (lst[id] == undefined)
								 {
									 chrome.storage.local.set({[id] : {}});
								 }
								 let acc_prec = lst["accomplish_prec"];
								 if (acc_prec == undefined)
								 {
									 acc_prec = 80;	
									 chrome.storage.local.set({accomplish_prec : acc_prec});
								 }
								 
								 sessionStorage.setItem("acc_prec", String(acc_prec));
								 find_submit_form().requestSubmit();
							 });
}

main();
