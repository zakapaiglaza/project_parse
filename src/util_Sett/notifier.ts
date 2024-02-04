import notifier from 'node-notifier';


class Notifier {
    static notify(title:string,message:string) {
        notifier.notify({title,message})
    }
}

export default Notifier;