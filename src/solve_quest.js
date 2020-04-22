// function form_ansobj(node)
// {
// 	let inps = node.querySelectorAll("input");
// 	let inp;
// 	for (let inp_node of inps)
// 		if (inp_node.type != "hidden")
// 		{
// 			inp = inp_node;
// 			break;
// 		}

// 	let ans_obj = { input : inp };

// 	let label = node.querySelector("label");
// 	if (label.childElementCount == 0) // test ans
// 	{
// 		ans_obj["caption"] = label.innerText.trim();
// 	}
// 	else if (label.childElementCount == 1) // single image
// 	{
// 		ans_obj["caption"] = label.firstElementChild.src;
// 	}
// 	else
// 	{
// 		alert("UNKNOWN ANS STRUCT");
// 	}
// 	return ans_obj;
// }


// function parse_answers()
// {
// 	let generic_nodes = document.querySelector(".answer").children;
// 	let answers_objlst = { lst : [], type : "" };
// 	for (let node of generic_nodes)
// 	{
// 		answers_objlst.lst.push(form_ansobj(node));
// 	}

// 	if (answers_objlst.lst[0].input.type == "radio")
// 	{
// 		answers_objlst.type = "single";
// 	}
// 	else if (answers_objlst.lst[0].input.type == "checkbox")
// 	{
// 		answers_objlst.type = "multiple";
// 	}
// 	else
// 	{
// 		alert("UNKNOWN INPUT TYPE " + answers_objlst.lst[0].input.type);
// 	}
// 	return answers_objlst;
// }
const is_empty_obj =
	  (obj) => Object.keys(obj).length === 0 && obj.constructor === Object;

function get_generic_ans(label) // image or text as answer option. for single and multiple
{
	let caption = "";
	if (label.childElementCount == 0) // test ans
	{
		caption = label.innerText.trim();
	}
	else if (label.childElementCount == 1) // single image
	{
		caption = label.firstElementChild.src;
	}
	else
	{
		alert("UNKNOWN ANS STRUCT");
	}
	return caption;
}


// ans_obj = { input : <ie input el>, caption : <any answer caption> }
// answers = { lst : [ans_obj...], type = <type> }
function parse_single()
{
	let ans_node = document.querySelector(".answer");
	let answers_obj = { lst : [], type : "single" };

	for (let opt_node of ans_node.children)
	{
		let ans_obj =
			{
				input : opt_node.querySelector("input"),
				caption : get_generic_ans(opt_node.querySelect("label"))
			};
		answers_obj.lst.push(ans_obj);
	}
	return answers_obj;
}


function parse_multiple()
{
	let ans_node = document.querySelector(".answer");
	let answers_obj = { lst : [], type : "multiple" };

	for (let opt_node of ans_node.children)
	{
		let ans_obj =
			{
				input : opt_node.querySelector("input[type=checkbox]"),
				caption : get_generic_ans(opt_node.querySelect("label"))
			};
		answers_obj.lst.push(ans_obj);
	}
	return answers_obj;
}


function parse_text()
{
	let ans_node = document.querySelector(".answer");
	let answers_obj = { lst : [], type : "text" };

	let ans_obj =
		{
			input : ans_node.firstElementChild,
			caption : ""
		}
	answers_obj.lst.push(ans_obj);
	return answers_obj;
}


function parse_answers()
{
	let ans_node = document.querySelector(".answer");
	let inps = ans_node.querySelectorAll("input");
	let inp;
	for (let inp_node of inps)
		if (inp_node.type != "hidden")
		{
			inp = inp_node;
			break;
		}
	if (inp.type == "radio")
		return parse_single();
	else if (inp.type == "checkbox")
		return parse_multiple();
	else if (inp.type == "text")
		return parse_text();
	else
		alert("UNKNOWN TYPE " + inp.type);
}


function check_ans(ans)
{
	let answers = parse_answers();
	console.log(answers, ans);
	if (!ans)
	{
		if (answers.type == "single")
		{
			answers.lst[0].input.checked = true;
		}
		else if (answers.type == "multiple")
		{
			answers.lst.forEach(e => e.input.checked = true);
		}
		else if (answers.type == "text")
		{
			answers.lst[0].input.value = String(parseInt(Math.random() * 1000));
		}
		else
		{
			alert("UNKNOWN ANS TYPE " + answers.type);
		}
	}
	else
	{
		if (answers.type == "single")
		{
			for (let answer_obj of answers.lst)
				if (answer_obj.caption == ans)
				{
					answer_obj.input.checked = true;
					break;
				}	
		}
		else if (answers.type == "multiple")
		{
			for (let answer_obj of answers.lst)
				if (ans.includes(answer_obj.caption))
					answer_obj.input.checked = true;
		}
		else if (answers.type == "text")
		{
			answers.lst[0].input.value = ans;
		}
		else
		{
			alert("UNKNOWN ANS TYPE " + answers.type);
		}
	}

	// document.querySelector("#responseform").requestSubmit();
	
	// document.querySelector("[name=next]").click();
}


function ask_db(id, q, callback)
{
	chrome.storage.local.get(id, (db_lst) =>
							 {
								 callback(db_lst[id][q]);
							 });
}


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

function main()
{
	const get_id = () => sessionStorage.getItem("id");

	ask_db(get_id(), get_q(document), check_ans);
}

main();
