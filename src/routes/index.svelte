<script>
    import Checkboxes from '../components/checkbox_list_component.svelte';
    import TempTable from '../components/temperature_table.svelte';
    import Uplot from '../components/uplot_v2.svelte';
    import io from "socket.io-client";

    let plot_data;
    let title;
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
    $: {}//console.log(controls, manual_mode)};

    let table_data = {'1k': 4.978491,
                                        '4k':   3.070931,
                                        'pump': 6.659844,
                                        'switch':   17.41950,
                                        'hp':   0.000000,
                                        'hs':   4.000000,
                                        'relays':   0,
                                     }
    var d = new Date();
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
        <Checkboxes bind:controls={controls} bind:manual_mode={manual_mode}/>
    </div>
  <div class="column main">
        <Uplot data={plot_data}/>
    </div>
</div>
