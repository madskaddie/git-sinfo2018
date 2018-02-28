

"use strict";



/** util functions */
function isUndefined(a) {
  return 'undefined' === a;
}

function safeGet(object, ...path) {
  let cur = object;
  for (let [idx, val] of path.entries()) {
    if (isUndefined(typeof(cur[val]))) {
      let msg = "undefined path: "+pp.slice(0,idx).join(".");
      throw new Error(msg);
    }
    cur = cur[val];
  }
  return cur;
}

function groupBy(fn, list) {
  let rvalue = {}
  for(let item of list) {
    let groupKey = fn(item)
    let groupList;
    if (isUndefined(typeof(rvalue[groupKey]))) {
      rvalue[groupKey] = groupList = []
    }
    else {
      groupList = rvalue[groupKey]
    }
    groupList.push(item)
  }
  return rvalue
}

function objectMap(fn, obj) {
  let rvalue = {}
  for (let key in obj) {
    let tmp = obj[key]
    let val = fn(key, tmp)
    rvalue[key] = val;
  }
  return rvalue;
}


/* business util functions*/

function emailOfCommitAuthor(commitItem) {
  return safeGet(commitItem, "commit", "author","email")
}

function dateOfCommit(commitItem) {
  let tmp = safeGet(commitItem, "commit", "author", "date");
  return new Date(tmp);
}


/* view functions */

function v_contentOf(commitItem) {
  let commit = safeGet(commitItem, "commit");
  let html = "<ul>"
  + "<li>"+ safeGet(commit, "author", "email")+"</li>"
  + "<li>"+safeGet(commit, "author", "date")+"</li>"
    "</ul>";
  return html;
}




const GH = new GitHub({token: CONF.token})
const repo = GH.getRepo('madskaddie/git-sinfo2018')

repo
  .listCommits({sha:'master'})
  .then(rsp => {
    let input = []
    rsp.data.forEach((val,idx,d) => {
      let email =  emailOfCommitAuthor(val);
      let committedAt = dateOfCommit(val)
      input.push({id:idx,
                 content: v_contentOf(val),
                 start: committedAt});
    });

    let container = document.getElementById('visualization');
    let items = new vis.DataSet(input);

    // Configuration for the Timeline
    let options = {};

    // Create a Timeline
    let timeline = new vis.Timeline(container, items, options);

    let groupByAuthorData = groupBy(emailOfCommitAuthor, rsp.data);

    /*
     * returns the min max date of the given commits
     */
    let computeLimits = (k,v) => {
      let min,max;
      if (v.length == 0) {
        throw new Error();
      }
      else {
        min = max = dateOfCommit(v[0]);
        if (v.length > 1) {
          for(let i=1; i<v.length; i++) {
            let d = dateOfCommit(v[i])
            min = (min.getTime() > d.getTime()) ? d : min
            max = (max.getTime() < d.getTime()) ? d : max
          }
        }
      }
      return [min,max];
    };
    let info = objectMap(computeLimits, groupByAuthorData)
    console.log(info)
  })


