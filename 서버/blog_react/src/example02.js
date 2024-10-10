import React, {useState} from "react";


function Comment(){
  return(
      <div>
        <div className='comment_h'>최근 댓글</div>
        <div className='comment_list'>
          <p>댓글1</p>
          <p>댓글2</p>
          <p>댓글3</p>
        </div>
      </div>
  );
}

function Searchbox(){
  return(
    <form className='search_box' action='' method='get'>
      <input className='search_txt' type='text' name="" placeholder='게시글 검색'></input>
      <button className='search-btn' type='submit'>
        <p>▶</p>
      </button>
    </form>
  )
}



function Postlist(){
  return(
    <div className='Postlist'>
      <div>게시글 목록</div>
    </div>
  );
}

function Side(){
  return(
    <div className='side'>
      <Searchbox></Searchbox>
      <Comment></Comment>
    </div>
  )
}


function Example01() {

    const [state, setState] = useState( {text: ""} );
  
    const handleChange = (e) => {
      setState( { [e.target.name]: e.target.value, } );
    }
    
    const onClick = () => {
      const textbox = {
        inText : state.text,
      };
  
      fetch("http://localhost:4000/text", {
        method: "post",
        headers: {
          "content-type" : "application/json",
        },
        body: JSON.stringify(textbox), 
        })
        .then((res)=>res.json())
        .then((json)=>{
            // console.log('들어옴')
            // console.log(json)
            alert(json.text);
            // setState({
            //     text:json.text,
            // });
       });
    };
  
    return (
      <div>
        <input name="text" onChange={handleChange}></input>
        <button onClick={onClick}>전송</button>
        <h3>{state.text}</h3>
      </div>
    );
  }
  
  export default Example01;