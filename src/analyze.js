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

// almost from solve_quest.js
function get_q(root)
{
	let q = "";
	for (let node of root.querySelector(".qtext").children)
	{
		if (node.nodeName == "P")
		{
			if (node.childElementCount == 0) // just a text
				q += node.innerText.trim();
			else if (node.childElementCount == 1 &&
					node.firstElementChild.nodeName == "IMG") // just an image
				q += node.firstElementChild.src;
			else
			{
				console.log("ERROR:", node);
				alert("UNKNOWN QUESTION PART");
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
	return ra_node.innerText.split(':')[1].trim();
}


function parse_multiple(ra_node)
{
	return ra_node.innerText.split(':')[1].split(',').map(e => e.trim());
}


function parse_text(ra_node)
{
	return parse_single(ra_node); // bcs theirs 'right answers' are familiar
}


function get_right_answer(qa_node)
{
	const q = get_q(qa_node);
	let ans = "";

	let inp_node = qa_node.querySelector(".answer").querySelector("input");

	let ra_node = qa_node.querySelector(".rightanswer");
	if (inp_node.type == "radio")
		ans = parse_single(ra_node);
	else if (inp_node.type == "checkbox")
		ans = parse_multiple(ra_node);
	else if (inp_node.type == "text")
		ans = parse_text(ra_node);
	else
	{
		alert("UNKNOWN INPUT TYPE " + inp_node.type);
	}
	return [q, ans];
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
			const rans = get_right_answer(node);
			db[rans[0]] = rans[1];

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
