<script>
    import Checkboxes from '../components/checkbox_list_component.svelte';
    import TempTable from '../components/temperature_table.svelte';
    import Uplot from '../components/uplot_v2.svelte';
    import io from "socket.io-client";

    let v='2';
        let table_data = {
        '1k': 4.978491,
        '4k':   3.070931,
        'pump': 6.659844,
        'switch':   17.41950,
        'hp':   0.000000,
        'hs':   4.000000,
        'relays':   0,
    }

    let states = [
        {id: 1, text: 'manual'},
        {id: 2, text: 'unknown'},
        {id: 3, text: 'warming to 300K'},
        {id: 4, text: 'cooling to 4K'},
        {id: 5, text: 'Warm pump'},
        {id: 6, text: 'Keep pump hot'},
        {id: 7, text: 'Cool pump'},
    ];
    let selected=3;
    let controls = [
        { value: false, text: 'Pump on' },
        { value: false, text: 'Switch on' },
        { value: false, text: 'Compressor' },
        //{ value: false, test: 'Enable heaters'}
    ];
    let manual_mode;
    let mounted = 0;
    let title = new Date().toLocaleString();
    let plot_data = [
        [],
        [],
        [],
        []]
    const socket = io();
    socket.on("message", function(message) {
        console.log("Got message:", message);
    });
    socket.on("button", function(message) {
        console.log("Got button message:", message);
    });
    socket.on("temp_data", function(new_data) {
        // console.log("temp data", new_data);
        title = new Date(new_data[0]*1000).toLocaleString();
        for (let i=0; i<plot_data.length; i++) {
            plot_data[i].push(new_data[i]);
        }
        plot_data = plot_data; // need this to update svelte arrays...
    });

    $: {if (mounted>1) socket.emit("button", [controls]);
        mounted++;
    }
    $:{if (manual_mode) {
        selected=1
    }}
    function set_manual(value) {
        manual_mode = value;
    }
    $:{
        if (selected>2) {
            set_manual(false);
            console.log('selected', selected)
        } else {
            set_manual(true);
        }
        socket.emit("mode", selected);
    }
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
        <select bind:value={selected}>
            {#each states as state}
                <option value={state.id}>
                    {state.text}
                </option>
            {/each}
        </select>
        <Checkboxes bind:controls={controls} bind:manual_mode={manual_mode}/>
    </div>
    <div class="column main">
        hello
        <Uplot data={plot_data}/>

    </div>
</div>
