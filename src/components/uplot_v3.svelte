<script>
    import { onMount, afterUpdate } from 'svelte';
    import {data_config, opts_config, colors} from '../tools/uplot_v3_config.js'
    // import uPlot from 'uplot';
    import filesaver from 'file-saver';
    let uPlot;
    export let data = data_config;
    export let opts = opts_config;
    export let labels = ['y0', 'y1']
    let plotDiv;
    let uplot;
    let autox = true;
    let autoy = true;
    let logy = 3;
    // console.log(opts)
    let y_range;
    let x_range;
    opts.scales.x.auto = ()=> {return autox}
    opts.scales.y.auto = ()=> {return autoy}
    //console.log(opts.scales.y.range);
    opts.scales.x.range = (self, min, max) => {
        min = min==null ? min : parseFloat(min);
        max = max==null ? max : parseFloat(max);
        x_range = [min, max];
        // console.log('x', x_range);
        return x_range
    }
    opts.scales.y.range = (self, min, max) => {
        console.log('before', min, max);
        if (!autoy) {
            let max_calc=[];
            let min_calc=[];
            for (let i=1; i<data.length; i++) {
                max_calc.push(Math.max(...data[i]))
                min_calc.push(Math.min(...data[i]))
            }
            max = Math.max(...max_calc);
            min = Math.min(...min_calc);
            console.log(min,max);
            min = 0.1
            max = 3
            y_range = uPlot.rangeNum(min, max, 0.1, true);;
        } else {
            y_range = uPlot.rangeNum(0.1, 3, 0.1, true);;
        }
        console.log('y:', y_range)
        return y_range;
    }
    opts.scales.y.range = null;
    opts['plugins'] =  [ 
       legendAsTooltipPlugin(),
     ]

    let s = [{}]
    for (let i=0; i<data.length-1; i++) {
        s.push({
            spanGaps: true,
            label: "y"+i,
            stroke: colors[9-i],
            width: 2
        })
    }
    opts.series = s;
    labels.forEach((item, index) => {
        opts.series[index+1].label = item;
    });
    let mounted = false;
    onMount(async () => {
        const module = await import ('uplot');
        uPlot = module.default;
        console.log("onMount")
        uplot = new uPlot(opts,data,plotDiv); 
        mounted = true;
    });
    afterUpdate( ()=> {
        // console.log(data)
        if (mounted) {
            if(uplot && autox && autoy) uplot.setData(data);
            else if (uplot) uplot.setData(data, false);
        }
    })
    function toggle_autox() {
        // console.log('autox: ', autox);
        autox = !autox;
    }
    function toggle_autoy() {
        autoy = !autoy;
    }
    function toggle_logy() {
        if (logy==3) {
            logy = 1;
        } else {
            logy = 3;
        }
        opts.scales.y.distr = logy;
        // Not sure which way is better...
        // plotDiv.innerHTML = '';
        plotDiv.removeChild(plotDiv.firstChild)
        uplot = new uPlot(opts,data,plotDiv); 
    }
    function saveCanvas()  {
        var canvas = document.querySelector(".u-wrap > canvas:nth-child(2)");
        console.log("canvas", canvas)
        canvas.toBlob(function(blob) {
            filesaver.saveAs(blob, "uplot.png");
        });
    }
    function legendAsTooltipPlugin({ className, style = { backgroundColor:"rgba(255, 249, 196, 0.92)", color: "black" } } = {}) {
        let legendEl;

        function init(u, opts) {
            legendEl = u.root.querySelector(".u-legend");

            legendEl.classList.remove("u-inline");
            className && legendEl.classList.add(className);

            // console.log(legendEl)
            

            uPlot.assign(legendEl.style, {
                textAlign: "left",
                pointerEvents: "none",
                display: "none",
                position: "absolute",
                left: 0,
                top: 0,
                // zIndex: 100,
                // boxShadow: "2px 2px 10px rgba(0,0,0,0.5)",
                // ...style
            });
            // hide series color markers
            const idents = legendEl.querySelectorAll(".u-marker");

            for (let i = 0; i < idents.length; i++)
                idents[i].style.display = "none";

            const overEl = u.root.querySelector(".u-over");
            overEl.style.overflow = "visible";

            // move legend into plot bounds
            overEl.appendChild(legendEl);

            // show/hide tooltip on enter/exit
            overEl.addEventListener("mouseenter", () => {legendEl.style.display = null;});
            overEl.addEventListener("mouseleave", () => {legendEl.style.display = "none";});

            // let tooltip exit plot
            //  overEl.style.overflow = "visible";
        }

        function update(u) {
            const { left, top } = u.cursor;
            legendEl.style.transform = "translate(" + left + "px, " + top + "px)";
        }

        return {
            hooks: {
                init: init,
                setCursor: update,
            }
        };
    }


</script>
<style>
button {
    font-size: 18px;
    }
</style>

<link rel="stylesheet" href="https://leeoniya.github.io/uPlot/dist/uPlot.min.css">
<button on:click={toggle_autox}>
  {#if autox}
  disable
  {:else}
  enable
  {/if}
  autoscale x
</button>
<button on:click={toggle_autoy}>
  {#if autoy}
  disable
  {:else}
  enable
  {/if}
  autoscale y
</button>
<button on:click={toggle_logy}>
  {#if logy==3}
  linear
  {:else}
  log
  {/if}
  y
</button>
<button on:click={saveCanvas}>
  PNG
</button>
<div bind:this={plotDiv}></div>


