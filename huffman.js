/**
 * Created by aarnavjindal on 25/04/20.
 */

import { BinaryHeap } from './heap.js';

export { HuffmanCoder }

class HuffmanCoder{

    //function for converting huffman tree to string
    stringify(node){
        if(typeof(node[1])==="string"){
            return '\''+node[1];
        }

        return '0' + this.stringify(node[1][0]) + '1' + this.stringify(node[1][1]);
    }

    display(node, modify, index=1){
        if(modify){
            node = ['',node];
            if(node[1].length===1)
                node[1] = node[1][0];
        }

        if(typeof(node[1])==="string"){
            return String(index) + " = " + node[1];
        }

        let left = this.display(node[1][0], modify, index*2);
        let right = this.display(node[1][1], modify, index*2+1);
        let res = String(index*2)+" <= "+index+" => "+String(index*2+1);
        return res + '\n' + left + '\n' + right;
    }

    //function for converting string back to huffman tree
    destringify(data){
        let node = [];
        if(data[this.ind]==='\''){
            this.ind++;
            node.push(data[this.ind]);
            this.ind++;
            return node;
        }

        this.ind++;
        let left = this.destringify(data);
        node.push(left);
        this.ind++;
        let right = this.destringify(data);
        node.push(right);

        return node;
    }

    getMappings(node, path){
        if(typeof(node[1])==="string"){
            this.mappings[node[1]] = path;
            return;
        }

        this.getMappings(node[1][0], path+"0");
        this.getMappings(node[1][1], path+"1");
    }

    encode(data){
        //get heap
        this.heap = new BinaryHeap();

        //get frequency of each character in the given text file
        const mp = new Map();
        for(let i=0;i<data.length;i++){
            if(data[i] in mp){
                mp[data[i]] = mp[data[i]] + 1;
            } else{
                mp[data[i]] = 1;
            }
        }

        //insert each of the frequency along with it's corresponding character into a min heap
        for(const key in mp){
            this.heap.insert([-mp[key], key]);
        }

        //create huffman tree
        while(this.heap.size() > 1){
            //remove minimum two nodes from the heap
            const node1 = this.heap.extractMax();
            const node2 = this.heap.extractMax();

            //create a new node [0,1] where 0 is the sum of freq of node1 and node2 and 1 is an array containing node1 and node2
            const node = [node1[0]+node2[0],[node1,node2]];
            this.heap.insert(node);
        }
        //the last node remaining in the tree gives root node of the huffman tree
        const huffman_encoder = this.heap.extractMax();

        //create a map which maps each character with its code 
        this.mappings = {};
        //generating the map using huffman tree
        this.getMappings(huffman_encoder, "");

        //creating converting each character of the text into its code using the created map
        let binary_string = "";
        for(let i=0;i<data.length;i++) {
            binary_string = binary_string + this.mappings[data[i]];
        }
        
        //padding binary string to make length multiple of 8
        let rem = (8 - binary_string.length%8)%8;
        let padding = "";
        for(let i=0;i<rem;i++)
            padding = padding + "0";
        binary_string = binary_string + padding;

        //converting the binary string in groups of 8 to the corresponding asci char and storing it in result
        let result = "";
        for(let i=0;i<binary_string.length;i+=8){
            let num = 0;
            for(let j=0;j<8;j++){
                num = num*2 + (binary_string[i+j]-"0");
            }
            result = result + String.fromCharCode(num);
        }

        let final_res = this.stringify(huffman_encoder) + '\n' + rem + '\n' + result;
        let info = "Compression Ratio : " + data.length/final_res.length;
        info = "Compression complete and file sent for download" + '\n' + info;
        return [final_res, this.display(huffman_encoder, false), info];
    }

    decode(data){
        //splitting string into huffman tree, padding and encoded text
        data = data.split('\n');
        if(data.length===4){
            // Handling new line
            data[0] = data[0] + '\n' + data[1];
            data[1] = data[2];
            data[2] = data[3];
            data.pop();
        }

        //decoding the huffman tree
        this.ind = 0;
        const huffman_decoder = this.destringify(data[0]);

        //getting back the binary string from the encoded text
        const text = data[2];
        let binary_string = "";
        for(let i=0;i<text.length;i++){
            let num = text[i].charCodeAt(0);
            let bin = "";
            for(let j=0;j<8;j++){
                bin = num%2 + bin;
                num = Math.floor(num/2);
            }
            binary_string = binary_string + bin;
        }

        //removing the extra padding that we added
        binary_string = binary_string.substring(0,binary_string.length-data[1]);

        console.log(binary_string.length);

        let res = "";
        let node = huffman_decoder;
        for(let i=0;i<binary_string.length;i++){
            if(binary_string[i]==='0'){
                node = node[0];
            } else{
                node = node[1];
            }

            if(typeof(node[0])==="string"){
                res += node[0];
                node = huffman_decoder;
            }
        }
        let info = "Decompression complete and file sent for download";
        return [res, this.display(huffman_decoder, true), info];
    }
}