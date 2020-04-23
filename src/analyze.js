function edit_src(src_str)
{
	return  src_str.split('/').slice(-2).join('');
}

function ensure_fullview()
{
	if (!location.search.includes("showall=1"))
		location.href += "&showall=1";
}


function get_test_prec()
{
	let tr_el = document.querySelector(".generaltable.generalbox.quizreviewsummary>tbody").lastElementChild.innerText;
	return parseInt(tr_el.match(/(?<=\()\d+/gi)[0]);
}


function get_q(root)
{
	let q = "";
	for (let node of root.querySelector(".qtext").children)
	{
		if (node.nodeName == "P")
		{
			q += node.innerText.trim();
			if (node.childElementCount > 0) // images in
			{
				for (let chpart of node.children)
				{
					if (chpart.nodeName == "IMG")
						q += edit_src(chpart.src);
					else if (chpart.nodeName == "I"		||
							 chpart.nodeName == "BR"	||
							 chpart.nodeName == "U")
						continue;
					else
					{
						console.log("ERROR:", node);
						alert("UNKNOWN QUESTION PART");
					}
				}
			}
		}
		else
		{
			alert("UNKNOWN NODE TYPE " + node.nodeName);
		}
	}
	console.log(q);
	return q;
}


const id = sessionStorage.getItem("id");


function parse_single(ra_node)	// right answer node
{
	let caption = ra_node.innerText.split(':')[1].trim();
	for (let chpart of ra_node.children)
	{
		if (chpart.nodeName == "IMG")
		{
			caption += edit_src(chpart.src);
		}
		else if (chpart.nodeName == "SPAN") // skip pbly
			continue
		else
		{
			console.log(chpart);
			alert("UNKNOWN ANS NODE " + chpart.nodeName);
		}
	}
	return [caption];
}


function parse_multiple(ra_node)
{
	let captions = ra_node.innerText.split(':')[1].split(',').map(e => e.trim());
	let i = 0;
	for (let chpart of ra_node.children)
	{
		if (chpart.nodeName == "IMG")
		{
			captions[i] += edit_src(chpart.src);
		}
		else
		{
			console.log("ERROR:", chpart);
			alert("UNKNOWN ANS NODE " + chpart.nodeName);			
		}
		i++;
	}
	return captions;
}


function parse_text(ra_node)
{
	return parse_single(ra_node)[0]; // bcs theirs 'right answers' are familiar
}


function get_right_answer(qa_node)
{
	const q = get_q(qa_node);
	let ans = "";
	let noreplace = true;		// if true replace previous, else append
	// if noreplace is set to false then return value MUST BE a list
	let inp_node = qa_node.querySelector(".answer").querySelector("input");

	let ra_node = qa_node.querySelector(".rightanswer");
	if (inp_node.type == "radio")
		ans = parse_single(ra_node), noreplace = false;
	else if (inp_node.type == "checkbox")
		ans = parse_multiple(ra_node);
	else if (inp_node.type == "text")
		ans = parse_text(ra_node);
	else
	{
		alert("UNKNOWN INPUT TYPE " + inp_node.type);
	}
	console.log(ans);
	return { rans : [q, ans], noreplace : noreplace };
}


function save(db)
{
	chrome.storage.local.set({[id] : db}, _ => location.href = `https://edu.rosdistant.ru/mod/quiz/view.php?id=${id}`);
}


function qa_loop(db)
{
	const qa_nodes = document.querySelector(".questionflagsaveform>div").children;
	for (let node of qa_nodes)
	{
		if (node.classList.contains("que"))
		{
			let info = get_right_answer(node);
			const rans = info.rans;
			if (info.noreplace || !db[rans[0]])
				db[rans[0]] = rans[1];
			else if (!info.noreplace) // prevent from repeating
				db[rans[0]] =
					db[rans[0]].concat(rans[1].filter(x => !db[rans[0]].includes(x)));
		}
	}
	console.log(db);
	setTimeout(() => save(db), 500);
}


function main()
{
	ensure_fullview();
	let acc_prec = parseInt(sessionStorage.getItem("acc_prec"));
	console.log(acc_prec, get_test_prec());
	if (acc_prec <= get_test_prec())
	{
		return;
	}
	chrome.storage.local.get(id, (lst) => qa_loop(lst[id]))
}

main();
