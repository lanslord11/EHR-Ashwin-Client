import React, { useState } from 'react';
import axios from 'axios';
import "./FileUpload.css";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';


function FileUpload({ contract, account, provider }) {
    const [file, setFile] = useState(null);
    const [fileName, setFileName] = useState("No image selected");
    const [fileType, setFileType] = useState("");
    const [keyword, setKeyword] = useState("");
    const [startTime, setStartTime] = useState(null);
const [endTime, setEndTime] = useState(null);
const [searchResults, setSearchResults] = useState([]);
const [searchFileType, setSearchFileType] = useState("");
const [searchKeyword, setSearchKeyword] = useState("");

    const handleSubmit = async (e) => {
        // toast("File uploaded successfully!");
        // return ;
        e.preventDefault();
        if (!file) return;

        try {
            const formData = new FormData();
            formData.append("file", file);
            
            const resFile = await axios({
                method: "post",
                url: "https://api.pinata.cloud/pinning/pinFileToIPFS",
                data: formData,
                headers: {
                    "pinata_api_key": "3eacec09a53ae019bab1",
                    "pinata_secret_api_key": "952394e8cbfea75d447a12e657512c6bc82989545de6ff4aade429166cf3b3da",
                },
            });
            toast("File uploaded successfully to IPFS!")
            const ImgHash = `ipfs://${resFile.data.IpfsHash}`;

            // Cloudinary upload
            const cloudinaryUrl = "https://api.cloudinary.com/v1_1/ddy5bsijt/image/upload";
            const cloudinaryFormData = new FormData();
            cloudinaryFormData.append("file", file);
            cloudinaryFormData.append("upload_preset", "urwvt5k1"); // Update this
            // console.log("Cloudinary Form Data is:", cloudinaryFormData)

            const cloudinaryResponse = await fetch(cloudinaryUrl, {
                method: "POST",
                body: cloudinaryFormData
            }).then(response => response.json());
           

            console.log("Uploaded to Cloudinary with URL:", cloudinaryResponse.secure_url);

            axios.post("http://localhost:5000/upload", {
                Pid: account,
                fhash: resFile.data.IpfsHash,
                Tf: fileType,
                Kw: keyword,
                fec: cloudinaryResponse.secure_url
            }).then((res) => {
                // console.log(res);
                // console.log(res.data);
                toast("File uploaded successfully to Cloud!")
            }).catch((error) => {
                console.error("Error uploading to Cloud:", error);
                toast("Unable to upload to Cloud");
            });

            contract.add(account, ImgHash).then((res) => {
                // console.log("Uploaded to blockchain with hash:", res.hash);
                toast("Hash uploaded successfully to Blockchain!")
            }).catch((error) => {
                console.error("Error uploading to blockchain:", error);
                toast("Unable to upload to Blockchain");
            });
            // alert("Successfully uploaded image");
            setFileName("No Image Selected");
            setFile(null);
        } catch (error) {
            console.error("Error uploading file:", error);
            toast("Unable to upload to IPFS or Cloud");
        }
    };

    const retrieveFile = (e) => {
        const data = e.target.files[0];
        setFile(data);
        setFileName(data.name);
    };

    const handleSearch = async () => {
        try {
            const res = await axios.get("http://localhost:5000/search", {
                params: {
                    Tf: searchFileType,
                    Kw: searchKeyword,
                    start: startTime,
                    end: endTime
                }
            });
            console.log(res);
            console.log(res.data);
            setSearchResults(res.data);
        } catch (error) {
            console.error("Error searching:", error);
            toast("Unable to search");
        }
    };

    return (<>
    <div className='top'>
    <ToastContainer />
            <form onSubmit={handleSubmit} className="form">
                <label htmlFor="file-upload" className='choose'>
                    Choose Image
                </label>
                <input disabled={!account} type="file" id="file-upload" onChange={retrieveFile} />
                <span className='textArea'>Image: {fileName}</span>
                <button type="submit" className="upload" disabled={!file}>Upload File</button>
                <input value={fileType} onChange={e => setFileType(e.target.value)} type="text" placeholder='File type' className='address' />
                <input value={keyword} onChange={e => setKeyword(e.target.value)} type="text" placeholder='Keyword' className='address' />
            </form>
        </div>
        <div className='top'>
            <h2>Search</h2>
            <div className="search-results">
                {searchResults.map((result, index) => (
                    <a href={result.fec} target="_blank" rel="noreferrer" style={{textDecoration:"none",color:"black"}}>

                    <div key={index} className="search-result">
                        <p><b>File Type:</b> {result.Tf}</p>
                        <p><b>Keyword:</b> {result.Kw}</p>
                            <img src={result.fec} alt="new" className='image-list' 
                            style={{ width: "200px", height: "200px" }}
                            />

                    </div>
                    </a>
                ))}
            </div>
    <form onSubmit={handleSubmit} className="form">
        <input value={searchFileType} onChange={e => setSearchFileType(e.target.value)} type="text" placeholder='File type' className='address' required />
        <input value={searchKeyword} onChange={e => setSearchKeyword(e.target.value)} type="text" placeholder='Keyword' className='address' required />
        <input value={startTime} onChange={e => setStartTime(e.target.value)} type="date" placeholder='Start Time' className='address' />
        <input value={endTime} onChange={e => setEndTime(e.target.value)} type="date" placeholder='End Time' className='address' />
        <button type="button" className="search" onClick={handleSearch}>Search</button>
    </form>
</div>
    </>
        
    );
}

export default FileUpload;
