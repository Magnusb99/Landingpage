export default defineAppConfig({
	ui: {
		colors: {
            primary: 'slatePrimary',
            secondary: 'slateSecondary',
            success: 'slateSuccess',
            info: 'slateInfo',
            warning: 'slateWarning',
            error: 'slateError',
            neutral: 'slateNeutral'
        },

    button: {
      slots: {
        base: 'rounded-none hover:cursor-pointer',
        label: 'font-mono',
      }
    },
    input: {
        slots: {
            base: 'rounded-none placeholder:text-neutral-700',
        }
    },
    header:{
        slots: {
            root: ' py-5 h-fit',
            container: 'flex flex-wrap justify-center ',
            toggle: 'hidden',
    }
},
pageCard: {
    slots: {
            root: 'rounded-lg border border-neutral-200 bg-neutral-50',
     
	}
}}
})