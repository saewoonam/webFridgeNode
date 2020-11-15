<script>
  import StateSelector from '../components/state_selector.svelte';
    let states = [
        {id: 1, text: 'manual'},    
        {id: 2, text: 'unknown'},   
        {id: 3, text: 'warming to 300K'},   
        {id: 4, text: 'cooling to 4K'}, 
        {id: 5, text: 'Warm pump'}, 
        {id: 6, text: 'Keep pump hot'}, 
        {id: 7, text: 'Cool pump'}, 
    ];
    let selected;
    $: {console.log('selected', selected)}
</script>
<StateSelector states={states} bind:selected={selected}/>
<p>
    Hello
</p>
