(function() {
let debug = false;
const ENDPOINT_WANDBOX_API_PERMLINK = "https://wandbox.org/api/permlink/";
const HOST_WANDBOX = "wandbox.org";
const testRespText = `
{
	"parameter" :	{
		"code" :	"package main\\n\\nimport (\\n    \\"fmt\\"\\n    \\"math/rand\\"\\n    \\"strconv\\"\\n    \\"strings\\"\\n)\\n\\nfunc show(nums []int) {\\n    numStrs := make([]string, len(nums))\\n    for i, n := range nums {\\n        numStrs[i] = strconv.Itoa(n)\\n    }\\n    \\n    fmt.Printf(\\"{%s}\\\\n\\", strings.Join(numStrs, \\", \\"))\\n}\\n\\nfunc main() {\\n    nums := []int{1, 2, 3, 4, 5, 6, 7, 8, 9}\\n    show(nums)\\n    rand.Shuffle(len(nums), func(i, j int) {\\n        nums[i], nums[j] = nums[j], nums[i]\\n    })\\n    show(nums)\\n}",
		"compiler" :	"go-head",
		"compiler-info" :	{
			"compiler-option-raw" :	false,
			"display-compile-command" :	"go run prog.go",
			"display-name" :	"go HEAD",
			"language" :	"Go",
			"name" :	"go-head",
			"provider" :	0,
			"runtime-option-raw" :	true,
			"switches" :	[
				
			]
			,
			"templates" :	[
				"go"
			]
			,
			"version" :	"devel +6ea4cfb"
		}
		,
		"compiler-option-raw" :	"",
		"created_at" :	1504988936,
		"description" :	"",
		"github_user" :	"",
		"is_private" :	false,
		"options" :	"",
		"runtime-option-raw" :	"",
		"stdin" :	"",
		"title" :	""
	}
	,
	"result" :	{
		"program_message" :	"{1, 2, 3, 4, 5, 6, 7, 8, 9}\\n{2, 4, 1, 7, 9, 3, 5, 8, 6}\\n",
		"program_output" :	"{1, 2, 3, 4, 5, 6, 7, 8, 9}\\n{2, 4, 1, 7, 9, 3, 5, 8, 6}\\n",
		"status" :	"0"
	}
	
}
`;

function getHostnameByString(path) {
  let aElement = document.createElement("a");
  aElement.href = path;
  return aElement.host;
}

function isHalfWidthAlphanumeric(text) {
	return !!text.match(/[^A-Za-z0-9]+/)
}

function extractCode(responseObject) {
  let result = responseObject.parameter;
  if (result && result.code) {
    return result.code;
  }
  return "";
}

function extractInput(responseObject) {
  let result = responseObject.parameter;
  if (result && result.stdin) {
    return result.stdin;
  }
  return "";
}

function extractOutput(responseObject) {
  let result = responseObject.result;
  if (result && result.program_message) {
    return result.program_message;
  }
  return "";
}

function extractLanguage(responseObject) {
  let result = responseObject.parameter;
  if (result && result["compiler-info"]) {
    let compilerInfo = result["compiler-info"];
    let lenguage = "";
    if (compilerInfo["display-name"]) {
      lenguage = compilerInfo["display-name"];
      if (compilerInfo.version) {
        lenguage += " " + compilerInfo.version;
      }
    }
    return lenguage;
  }
  return "";
}

function loadResultByPermlink(link, container) {
  if (isHalfWidthAlphanumeric(link)) {
    return;
  }
  
  let xhttp = new XMLHttpRequest();
  xhttp.open("GET", ENDPOINT_WANDBOX_API_PERMLINK + link, true);
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      try {
        let resp = JSON.parse(this.responseText);
        addCodeContainer(resp, container)
      } catch(e) {
        console.log(e);
      }
    }
  };
  xhttp.send();
}

function addCodeContainer(resp, container) {
  // build code element
  let codeText = extractCode(resp);
  if (codeText) {
    container.classList.add("wb-result-container");
    container.textContent = "";
    
    let codeLabel = document.createElement("div");
    codeLabel.classList.add("wb-code-label");
    let language = extractLanguage(resp);
    if (language) {
      codeLabel.textContent = "Code(" + language + ")";
    } else {
      codeLabel.textContent = "Code";
    }
    container.appendChild(codeLabel);
    
    let codeElement = document.createElement("pre");
    codeElement.classList.add("prettyprint");
    codeElement.classList.add("wb-code");
    codeElement.textContent = codeText;
    container.appendChild(codeElement);
  }
  
  // build input element
  let inputText = extractInput(resp);
  if (inputText) {
    let inputLabel = document.createElement("div");
    inputLabel.classList.add("wb-input-label");
    inputLabel.textContent = "Input";
    container.appendChild(inputLabel);
    
    let inputElement = document.createElement("pre");
    inputElement.classList.add("wb-input");
    inputElement.textContent = inputText;
    container.appendChild(inputElement);
  }
  
  // build output element
  let outputText = extractOutput(resp);
  if (outputText) {
    let outputLabel = document.createElement("div");
    outputLabel.classList.add("wb-output-label");
    outputLabel.textContent = "Output";
    container.appendChild(outputLabel);
    
    let outputElement = document.createElement("pre");
    outputElement.classList.add("wb-output");
    outputElement.textContent = outputText;
    container.appendChild(outputElement);
  }
}

function getPermlink(value) {
  let frg = value.split("/").filter(function(e){ return e });
  if (frg.length == 0) {
    return "";
  }
  return frg[frg.length - 1];
}

let divTags = document.getElementsByTagName("div");

let divHasWandboxPaths = Array.from(divTags).filter(function(divTag){
  return divTag.children.length == 0 && getHostnameByString(divTag.textContent) == HOST_WANDBOX;
});

if (divHasWandboxPaths.length > 0) {
  injectScripts();
  
  divHasWandboxPaths.filter(function(divHasWandboxPath) {
    let permlink = getPermlink(divHasWandboxPath.textContent);
    
    if (debug) {
      addCodeContainer(JSON.parse(testRespText), divHasWandboxPath);
    } else {
      loadResultByPermlink(permlink, divHasWandboxPath);
    }
  });
}
})();