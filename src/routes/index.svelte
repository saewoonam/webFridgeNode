<script>
    import {onMount} from 'svelte';
    import Checkboxes from '../components/checkbox_list_component.svelte';
    import TempTable from '../components/temperature_table.svelte';
    import Uplot from '../components/uplot_v2.svelte';
    import io from "socket.io-client";
    import StateSelector from '../components/state_selector.svelte';

    let plot_data;
    let title;
    let mounted=0; // keep track of how many times the controls are updated
    let selected;
    let state_id = 2;
    let states = [
        {id: 1, text: 'manual'},
        {id: 2, text: 'unknown'},
        {id: 3, text: 'warming to 300K'},
        {id: 4, text: 'cooling to 4K'},
        {id: 5, text: 'Warm pump'},
        {id: 6, text: 'Keep pump hot'},
        {id: 7, text: 'Cool pump'},
    ];

    const socket = io();

    socket.on("message", function(message) {
        console.log("Got message:", message);
    });

    socket.on("temp_data", function(new_data) {
        // console.log("temp data", new_data);
        title = new Date(new_data[0]*1000).toLocaleString();
        for (let i=0; i<plot_data.length; i++) {
            plot_data[i].push(new_data[i]);
        }
        plot_data = plot_data; // need this to update svelte arrays...
    });

    export let controls = [
        { value: false, text: 'Pump on' },
        { value: false, text: 'Switch on' },
        { value: false, text: 'Compressor' },
        //{ value: false, test: 'Enable heaters'}
    ];
    export let manual_mode = true;
    $: {if (mounted>1) socket.emit("button", [manual_mode, controls]);
        mounted++;
    }
    $: {console.log('state_id', state_id)}
    $: {console.log('selected', selected)}
    let table_data = {
        '1k': 4.978491,
        '4k':   3.070931,
        'pump': 6.659844,
        'switch':   17.41950,
        'hp':   0.000000,
        'hs':   4.000000,
        'relays':   0,
    }
    title = new Date().toLocaleString();
    plot_data = [
        [],
        [],
        [],
        []]
    /* setInterval( () => { */
    /*     let temp = [] */
    /*     d = new Date(); */
    /*     title = d.toLocaleString(); */
    /*     for (let i=0; i<plot_data.length; i++) { */
    /*         if(i==0) temp[0] = [...plot_data[0], Date.now()/1000]; */
    /*         else temp[i] = [...plot_data[i], 100*Math.random()];             */
    /*     } */
    /*     plot_data = temp; */
    /*     // console.log(plot_data.length, plot_data[0].length) */
    /* }, 10000); */
</script>
<style>
* {
  box-sizing: border-box;
}
.column {
  float: left;
  padding: 10px;
}

/* Left and right column */
.column.side {
  width: 25%;
}

/* Middle column */
.column.main {
  width: 70%;
}

/* Clear floats after the columns */
.row:after {
  content: "";
  display: table;
  clear: both;
}

/* Responsive layout - makes the three columns stack on top of each other instead of next to each other */
@media screen and (max-width: 600px) {
  .column.side, .column.main {
    width: 100%;
  }
}
</style>
<div class="row">
  <div class="column side">
    
        <TempTable table_data={table_data} title={title} />
        <StateSelector bind:selected/>
        <Checkboxes bind:controls={controls} bind:manual_mode={manual_mode}/>
    </div>
  <div class="column main">
        <Uplot data={plot_data}/>
    </div>
</div>
